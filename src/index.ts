import * as dotenv from 'dotenv'
import { Prisma } from './generated/prisma-client'
import datamodelInfo from './generated/nexus-prisma'
import { makePrismaSchema } from 'nexus-prisma'
import * as path from 'path'
import * as allTypes from './resolvers'
import { ApolloServer } from 'apollo-server'
import * as jwt from 'jsonwebtoken'
import { Token } from './types'
import { PORT } from "./constant"

dotenv.config()

const prisma = new Prisma({
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET
})

const schema = makePrismaSchema({
  // Provide all the GraphQL types we've implemented
  types: [ allTypes ],

  // Configure the interface to Prisma
  prisma: {
    datamodelInfo,
    client: prisma
  },

  // Specify where Nexus should put the generated files
  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts')
  },

  // Configure nullability of input arguments: All arguments are non-nullable by default
  nonNullDefaults: {
    input: true,
    output: true
  },

  // Configure automatic type resolution for the TS representations of the associated types
  typegenAutoConfig: {
    sources: [
      {
        source: path.join(__dirname, './types.ts'),
        alias: 'types'
      }
    ],
    contextType: 'types.Context'
  },

  shouldGenerateArtifacts: Boolean(
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  )
})

const server = new ApolloServer({
  schema,
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
