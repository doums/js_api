import { ApolloError } from 'apollo-server'

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

  async user(root, { id }, ctx) {
    const userExists = await ctx.prisma.$exists.user({ id })
    if (!userExists) {
      throw new ApolloError(`No user found for id "${id}"`, 'USER_ERROR')
    }
    return ctx.prisma.user({ id })
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
  },

  users(root, args, ctx) {
    return ctx.prisma.users({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      first: args.first,
      last: args.last
    })
  },

  amIAuth(root, args, ctx) {
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
