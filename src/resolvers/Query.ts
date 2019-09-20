import * as jwt from 'jsonwebtoken'
import { prismaObjectType } from 'nexus-prisma'
import { idArg, stringArg } from 'nexus'
import { AuthenticationError } from 'apollo-server'

interface Token {
  userId: string;
}

export const Query = prismaObjectType<'Query'>({
  name: 'Query',
  definition: t => {
    t.field('posts', {
      ...t.prismaType.posts,
      resolve: async (parent, args, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        return ctx.prisma.posts(
          {
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            first: args.first,
            last: args.last
          }
        )
      }
    })
    t.field('post', {
      type: 'Post',
      nullable: true,
      args: { id: idArg() },
      resolve: (parent, { id }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        return ctx.prisma.post({ id })
      }
    })
    t.field('published', {
      type: 'Post',
      nullable: true,
      args: {
        slug: stringArg()
      },
      resolve: async (parent, { slug }, ctx) => {
        const exist = await ctx.prisma.$exists.post({ slug, published: true })
        if (!exist) {
          return null
        }
        return ctx.prisma.post({ slug })
      }
    })
    t.field('home', {
      type: 'Post',
      nullable: true,
      resolve: async (parent, args, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        const [ post ] = await ctx.prisma.posts({ where: { type: 'HOME' } })
        return post
      }
    })
    t.field('about', {
      type: 'Post',
      nullable: true,
      resolve: async (parent, args, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        const [ post ] = await ctx.prisma.posts({ where: { type: 'ABOUT' } })
        return post
      }
    })
    t.field('contact', {
      type: 'Post',
      nullable: true,
      resolve: async (parent, args, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        const [ post ] = await ctx.prisma.posts({ where: { type: 'CONTACT' } })
        return post
      }
    })
    t.field('publishedHome', {
      type: 'Post',
      nullable: true,
      resolve: async (parent, args, ctx) => {
        const [ post ] = await ctx.prisma.posts({ where: { type: 'HOME', published: true } })
        return post
      }
    })
    t.field('publishedAbout', {
      type: 'Post',
      nullable: true,
      resolve: async (parent, args, ctx) => {
        const [ post ] = await ctx.prisma.posts({ where: { type: 'ABOUT', published: true } })
        return post
      }
    })
    t.field('publishedContact', {
      type: 'Post',
      nullable: true,
      resolve: async (parent, args, ctx) => {
        const [ post ] = await ctx.prisma.posts({ where: { type: 'CONTACT', published: true } })
        return post
      }
    })
    t.field('postsCount', {
      type: 'Int',
      resolve: async (parent, args, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        return await ctx.prisma
          .postsConnection()
          .aggregate()
          .count()
      }
    })
    t.field('publishedCount', {
      type: 'Int',
      resolve: async (parent, args, ctx) => {
        return ctx.prisma
          .postsConnection({ where: { published: true, type: 'ARTICLE' } })
          .aggregate()
          .count()
      }
    })
    t.field('amIAuth', {
      type: 'AuthCheck',
      resolve: async (parent, args, ctx) => {
        const Authorization = ctx.req.headers.authorization
        if (Authorization) {
          const token = Authorization.replace('Bearer ', '')
          try {
            const { userId } = jwt.verify(token, process.env.API_SECRET) as Token
            const me = await ctx.prisma.user({ id: userId })
            if (!me) {
              return { isAuth: false }
            }
            return { isAuth: true, me }
          } catch (e) {
            return { isAuth: false }
          }
        }
        return { isAuth: false }
      }
    })
    t.field('regStatus', {
      type: 'RegStatus',
      nullable: true,
      resolve: async (parent, args, ctx) => {
        const [ regStatus ] = await ctx.prisma.regStatuses()
        return regStatus
      }
    })
  }
})

