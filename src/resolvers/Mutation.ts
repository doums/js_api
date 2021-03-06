import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { ApolloError, AuthenticationError } from 'apollo-server-koa'
import { AuthPayload, Context } from '../types'
import { Post, Talk, User } from '../generated/prisma-client'
import emailRegex from 'email-regex'

const Mutation = {
  async signUp (root: any, args: any, ctx: Context): Promise<AuthPayload> {
    const password = await bcrypt.hash(args.password, 10)
    if (!emailRegex({exact: true}).test(args.email)) {
      throw new ApolloError('provide a valid email address', 'USER_ERROR')
    }
    const user = await ctx.prisma.createUser({ ...args, password })
    return {
      token: jwt.sign({ userId: user.id }, process.env.API_SECRET),
      user
    }
  },

  async signIn (root: any, { email, password }: any, ctx: Context): Promise<AuthPayload> {
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

  async createTalk (root: any, { name, description }: any, ctx: Context): Promise<Talk> {
    if (!ctx.user) {
      throw new AuthenticationError('Not authorized')
    }
    ctx.io.emit('talk_created')
    return ctx.prisma.createTalk({
      name,
      description
    })
  },

  async createPost (root: any, { talkId, text }: any, ctx: Context): Promise<Post> {
    const { user } = ctx
    if (!user) {
      throw new AuthenticationError('Not authorized')
    }
    const newPost = await ctx.prisma.createPost({
      text,
      author: {
        connect: { id: user.id }
      },
      talk: {
        connect: { id: talkId }
      }
    })
    ctx.io.emit('post_created', {
      talkId
    })
    return newPost
  },

  async updatePost (root: any, { id, text }: any, ctx: Context): Promise<Post> {
    if (!ctx.user) {
      throw new AuthenticationError('Not authorized')
    }
    const post = await ctx.prisma.post({ id })
    const author = await ctx.prisma.post({ id }).author()
    const talk = await ctx.prisma.post({ id }).talk()
    if (!post) {
      throw new ApolloError(`No post found for id "${id}"`, 'USER_ERROR')
    }
    if (author.id !== ctx.user.id) {
      throw new ApolloError('The current user is not the author of this post', 'USER_ERROR')
    }
    const updatedPost = ctx.prisma.updatePost({
      where: { id },
      data: { text }
    })
    ctx.io.emit('post_updated', {
      talkId: talk.id
    })
    return updatedPost
  },

  async deletePost (root: any, { id }: any, ctx: Context): Promise<Post> {
    if (!ctx.user) {
      throw new AuthenticationError('Not authorized')
    }
    const post = await ctx.prisma.$exists.post({ id })
    const talk = await ctx.prisma.post({ id }).talk()
    const author = await ctx.prisma.post({ id }).author()
    if (!post) {
      throw new ApolloError(`No post found for id "${id}"`, 'USER_ERROR')
    }
    if (author.id !== ctx.user.id) {
      throw new ApolloError('The current user is not the author of this post', 'USER_ERROR')
    }
    const deletedPost = await ctx.prisma.deletePost({ id })
    ctx.io.emit('post_deleted', {
      talkId: talk.id
    })
    return deletedPost
  },

  async updateBio (root: any, { bio }: any, ctx: Context): Promise<User> {
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
