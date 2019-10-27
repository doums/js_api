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
import { GraphQLError } from 'graphql'
import Router from 'koa-router'

const app = new Koa()
// const router = new Router()

const server = new ApolloServer({
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
    return ({ ...req, prisma, user })
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

// CORS's needs
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH')
  ctx.set('Access-Control-Allow-Headers', 'Content-Type')
  await next()
})

// accept CORS preflight request
// router.options('/', ctx => {
//   ctx.status = 200
// })

server.applyMiddleware({ app, path: '/' })

app
  // .use(router.routes())
  // .use(router.allowedMethods())
  .listen(PORT, () => console.log(`🗻app ready on port ${PORT}`))
