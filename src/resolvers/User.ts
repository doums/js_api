import { prismaObjectType } from 'nexus-prisma'

export const User = prismaObjectType({
  name: 'User',
  definition (t) {
    t.prismaFields([
      'id',
      'email',
      'username',
      'bio',
      {
        name: 'posts',
        args: [] // remove the arguments from the `posts` field of the `User` type in the Prisma schema
      }
    ])
  }
})