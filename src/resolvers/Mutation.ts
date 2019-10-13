import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { ApolloError, AuthenticationError } from 'apollo-server'
import { AuthPayload } from '../types'
import { Post, Talk, User } from '../generated/prisma-client'

const Mutation = {
  async signup (root, args, ctx): Promise<AuthPayload> {
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.prisma.createUser({ ...args, password })
    return {
      token: jwt.sign({ userId: user.id }, process.env.API_SECRET),
      user
    }
  },

  async signin (root, { email, password }, ctx): Promise<AuthPayload> {
    const user = await ctx.prisma.user({ email })
    if (!user) {
      throw new Error('Invalid email')
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
    return {
      token: jwt.sign({ userId: user.id }, process.env.API_SECRET),
      user
    }
  },

  async createTalk (root, { name, description }, ctx): Promise<Talk> {
    if (!ctx.user) {
      throw new AuthenticationError('Not authorized')
    }
    return ctx.prisma.createTalk({
      name,
      description,
      activeUsers: {
        connect: { id: ctx.user.id }
      }
    })
  },

  async joinTalk (root, { id }, ctx): Promise<Talk> {
    const { user } = ctx
    if (!user) {
      throw new AuthenticationError('Not authorized')
    }
    const talkExists = await ctx.prisma.$exists.talk({ id })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${id}"`, 'USER_ERROR')
    }
    const activeUsers = await ctx.prisma.talk({ id }).activeUsers()
    if (activeUsers.find((activeUser: User) => activeUser.id == user.id)) {
      throw new ApolloError('The user is already participating in this talk', 'USER_ERROR')
    }
    return ctx.prisma.updateTalk({
      where: { id },
      data: {
        activeUsers: {
          connect:  { id: user.id }
        }
      }
    })
  },

  async leaveTalk (root, { id }, ctx): Promise<Talk> {
    const { user } = ctx
    if (!user) {
      throw new AuthenticationError('Not authorized')
    }
    const talkExists = await ctx.prisma.$exists.talk({ id })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${id}"`, 'USER_ERROR')
    }
    const activeUsers = await ctx.prisma.talk({ id }).activeUsers()
    if (!activeUsers.find((activeUser: User) => activeUser.id == user.id)) {
      throw new ApolloError('The user does not participate in this discussion', 'USER_ERROR')
    }
    return ctx.prisma.updateTalk({
      where: { id },
      data: {
        activeUsers: {
          disconnect:  { id: user.id }
        }
      }
    })
  },

  async createPost (root, { text, talkId }, ctx): Promise<Post> {
    if (!ctx.user) {
      throw new AuthenticationError('Not authorized')
    }
    const talkExists = await ctx.prisma.$exists.talk({ id: talkId })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${talkId}"`, 'USER_ERROR')
    }
    const activeUsers = await ctx.prisma.talk({ id: talkId }).activeUsers()
    if (!activeUsers.find((activeUser: User) => activeUser.id === ctx.user.id)) {
      throw new ApolloError('The user does not participate in this discussion', 'USER_ERROR')
    }
    return ctx.prisma.createPost({
      text,
      author: {
        connect: { id: ctx.user.id }
      },
      talk: {
        connect: { id: talkId }
      }
    })
  },

  async updatePost (root, { id, text }, ctx): Promise<Post> {
    if (!ctx.user) {
      throw new AuthenticationError('Not authorized')
    }
    const post = await ctx.prisma.post({ id })
    const author = await ctx.prisma.post({ id }).author()
    if (!post) {
      throw new ApolloError(`No post found for id "${id}"`, 'USER_ERROR')
    }
    if (author.id !== ctx.user.id) {
      throw new ApolloError('The current user is not the author of this post', 'USER_ERROR')
    }
    return ctx.prisma.updatePost({
      where: { id },
      data: { text }
    })
  },

  async deletePost (root, { id }, ctx): Promise<Post> {
    if (!ctx.user) {
      throw new AuthenticationError('Not authorized')
    }
    const post = await ctx.prisma.$exists.post({ id })
    const author = await ctx.prisma.post({ id }).author()
    if (!post) {
      throw new ApolloError(`No post found for id "${id}"`, 'USER_ERROR')
    }
    if (author.id !== ctx.user.id) {
      throw new ApolloError('The current user is not the author of this post', 'USER_ERROR')
    }
    return ctx.prisma.deletePost({ id })
  },

  async updateBio (root, { bio }, ctx): Promise<User> {
    if (!ctx.user) {
      throw new AuthenticationError('Not authorized')
    }
    return ctx.prisma.updateUser({
      where: { id: ctx.user.id },
      data: { bio }
    })
  }
}

export default Mutation