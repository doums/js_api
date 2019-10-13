import * as dotenv from 'dotenv'
dotenv.config()

import { prisma } from './generated/prisma-client'
import typeDefs from './typeDefs'
import { resolvers } from './resolvers'
import { ApolloServer } from 'apollo-server'
import * as jwt from 'jsonwebtoken'
import { Context, Token } from './types'
import { PORT } from './constant'
import { GraphQLError } from 'graphql'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (req): Promise<Context> => {
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
  formatError: (error): GraphQLError => {
    console.log(error)
    return error
  }
})

server.listen(PORT).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
