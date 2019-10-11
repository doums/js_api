import * as dotenv from 'dotenv'
dotenv.config()

import { prisma } from './generated/prisma-client'
import typeDefs from './typeDefs'
import { resolvers } from './resolvers'
import { ApolloServer } from 'apollo-server'
import * as jwt from 'jsonwebtoken'
import { Token } from './types'
import { PORT } from './constant'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async req => {
    let user = null
    const authorization= req.req.get('Authorization')
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
  formatError: error => {
    console.log(error)
    return error
  }
})

server.listen(PORT).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
