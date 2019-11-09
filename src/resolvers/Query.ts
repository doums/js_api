import { ApolloError } from 'apollo-server-koa'
import { Post, Talk, User } from '../generated/prisma-client'
import { AuthCheck, Context } from '../types'

const Query = {
  async post (root: any, { id }: any, ctx: Context): Promise<Post | null> {
    const postExists = await ctx.prisma.$exists.post({ id })
    if (!postExists) {
      throw new ApolloError(`No post found for id "${id}"`, 'USER_ERROR')
    }
    return ctx.prisma.post({ id })
  },

  async postsByTalk (root: any, { talkId }: any, ctx: Context): Promise<Array<Post>> {
    const talkExists = await ctx.prisma.$exists.talk({ id: talkId })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${talkId}"`, 'USER_ERROR')
    }
    return ctx.prisma.posts({
      where: { talk: { id: talkId } }
    })
  },

  async talk (root: any, { id }: any, ctx: Context): Promise<Talk | null> {
    const talkExists = await ctx.prisma.$exists.talk({ id })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${id}"`, 'USER_ERROR')
    }
    return ctx.prisma.talk({ id })
  },

  async user (root: any, { id }: any, ctx: Context): Promise<User | null> {
    const userExists = await ctx.prisma.$exists.user({ id })
    if (!userExists) {
      throw new ApolloError(`No user found for id "${id}"`, 'USER_ERROR')
    }
    return ctx.prisma.user({ id })
  },

  posts (root: any, args: any, ctx: Context): Promise<Array<Post>> {
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

  talks (root: any, args: any, ctx: Context): Promise<Array<Talk>> {
    return ctx.prisma.talks({
      where: args.where,
      orderBy: 'createdAt_DESC',
      skip: args.skip,
      first: args.first,
      last: args.last
    })
  },

  users (root: any, args: any, ctx: Context): Promise<Array<User>> {
    return ctx.prisma.users({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      first: args.first,
      last: args.last
    })
  },

  amIAuth (root: any, args: any, ctx: Context): AuthCheck {
    if (ctx.user) {
      return {
        isAuth: true,
        me: ctx.user
      }
    }
    return {
      isAuth: false,
      me: null
    }
  }
}

export default Query
