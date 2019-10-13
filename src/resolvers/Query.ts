import { ApolloError } from 'apollo-server'
import { Post, Talk, User } from '../generated/prisma-client'
import { AuthCheck } from '../types'

const Query = {
  async post (root, { id }, ctx): Promise<Post> {
    const postExists = await ctx.prisma.$exists.post({ id })
    if (!postExists) {
      throw new ApolloError(`No post found for id "${id}"`, 'USER_ERROR')
    }
    return ctx.prisma.post({ id })
  },

  async talk (root, { id }, ctx): Promise<Talk> {
    const talkExists = await ctx.prisma.$exists.talk({ id })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${id}"`, 'USER_ERROR')
    }
    return ctx.prisma.talk({ id })
  },

  async user (root, { id }, ctx): Promise<User> {
    const userExists = await ctx.prisma.$exists.user({ id })
    if (!userExists) {
      throw new ApolloError(`No user found for id "${id}"`, 'USER_ERROR')
    }
    return ctx.prisma.user({ id })
  },

  posts (root, args, ctx): Promise<Array<Post>> {
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

  talks (root, args, ctx): Promise<Array<Talk>> {
    return ctx.prisma.talks({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      first: args.first,
      last: args.last
    })
  },

  users (root, args, ctx): Promise<Array<User>> {
    return ctx.prisma.users({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      first: args.first,
      last: args.last
    })
  },

  amIAuth (root, args, ctx): AuthCheck {
    if (ctx.user) {
      return {
        isAuth: true,
        me: ctx.user
      }
    }
    return {
      isAuth: false,
      me: ctx.user
    }
  }
}

export default Query
