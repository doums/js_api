import * as dotenv from 'dotenv'
dotenv.config()

import { prisma } from './generated/prisma-client'
import typeDefs from './typeDefs'
import { resolvers } from './resolvers'
import { ApolloServer } from 'apollo-server-koa'
import * as jwt from 'jsonwebtoken'
import { Context, Token } from './types'
import { PORT } from './constant'
import Koa from 'koa'
import { createServer } from 'http'
import { GraphQLError } from 'graphql'
import io from 'socket.io'

const app = new Koa()
const server = createServer(app.callback())

// inject socket.io in koa context
app.context.io = io(server)

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (req): Promise<Context> => {
    let user = null
    const authorization= req.ctx.header['authorization']
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      try {
        const { userId } = jwt.verify(token, process.env.API_SECRET) as Token
        user = await prisma.user({ id: userId })
      } catch (e) {
        user = null
      }
    }
    return ({ ...req, prisma, user, io: req.ctx.io })
  },
  introspection: true,
  playground: {
    settings: {
      'editor.theme': 'dark',
      'editor.fontFamily': 'Inconsolata',
      'editor.reuseHeaders': true
    }
  },
  formatError: (error): GraphQLError => {
    console.log(error)
    return error
  }
})

app.on('error', err => {
  console.log('server error', err)
})

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
    ctx.app.emit('error', err, ctx)
  }
})

apolloServer.applyMiddleware({
  app,
  path: '/',
  cors: true
})

server.listen(PORT, () => console.log(`app ready on port ${PORT}`))
