import * as jwt from 'jsonwebtoken'
import { ApolloError, AuthenticationError } from 'apollo-server'

interface Token {
  userId: string;
}

const Query = {
  async post(root, { id }, ctx) {
    const postExists = await ctx.prisma.$exists.post({ id })
    if (!postExists) {
      throw new ApolloError(`No post found for id "${id}"`, 'USER_ERROR')
    }
    return ctx.prisma.post({ id })
  },

  async talk(root, { id }, ctx) {
    const talkExists = await ctx.prisma.$exists.talk({ id })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${id}"`, 'USER_ERROR')
    }
    return ctx.prisma.talk({ id })
  },

  posts(root, args, ctx) {
    return ctx.prisma.posts(
      {
        where: args.where,
        orderBy: args.orderBy,
        skip: args.skip,
        first: args.first,
        last: args.last
      }
    )
  },

  talks(root, args, ctx) {
    return ctx.prisma.talks({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      first: args.first,
      last: args.last
    })
  }
}

/* export const Query = prismaObjectType<'Query'>({
 *   name: 'Query',
 *   definition: t => {
 *     t.field('posts', {
 *       ...t.prismaType.posts,
 *       resolve: async (parent, args, ctx) => {
 *         if (!ctx.user) {
 *           throw new AuthenticationError('Not authorized')
 *         }
 *         return ctx.prisma.posts(
 *           {
 *             where: args.where,
 *             orderBy: args.orderBy,
 *             skip: args.skip,
 *             first: args.first,
 *             last: args.last,
 *           }
 *         )
 *       }
 *     })
 *     t.field('post', {
 *       type: 'Post',
 *       nullable: true,
 *       args: { id: idArg() },
 *       resolve: (parent, { id }, ctx) => {
 *         if (!ctx.user) {
 *           throw new AuthenticationError('Not authorized')
 *         }
 *         return ctx.prisma.post({ id })
 *       }
 *     })
 *     t.field('amIAuth', {
 *       type: 'AuthCheck',
 *       resolve: async (parent, args, ctx) => {
 *         const Authorization = ctx.req.headers.authorization
 *         if (Authorization) {
 *           const token = Authorization.replace('Bearer ', '')
 *           try {
 *             const { userId } = jwt.verify(token, process.env.API_SECRET) as Token
 *             const me = await ctx.prisma.user({ id: userId })
 *             if (!me) {
 *               return { isAuth: false }
 *             }
 *             return { isAuth: true, me }
 *           } catch (e) {
 *             return { isAuth: false }
 *           }
 *         }
 *         return { isAuth: false }
 *       }
 *     })
 *   }
 * })
 *  */

export default Query
