import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { ApolloError, AuthenticationError } from 'apollo-server'
import * as _ from 'lodash'

export const Mutation = {
  async signup(root, args, ctx) {
    const password = await bcrypt.hash(args.password, 10)
    console.log('here')
    const user = await ctx.prisma.createUser({ ...args, password })
    return {
      token: jwt.sign({ userId: user.id }, process.env.API_SECRET),
      user
    }
  },

  async login(root, { email, password }, ctx) {
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
  }
}

/*export const Mutation = prismaObjectType<'Mutation'>({
  name: 'Mutation',
  definition (t) {
    /*t.field('createPost', {
      type: 'Post',
      args: {
        title: stringArg(),
        body: arg({ type: 'Json' }),
        images: arg({ type: 'ImageInput', list: true }),
        type: arg({ type: 'PostType', nullable: true, default: 'ARTICLE' })
      },
      resolve: async (parent, { title, images, body, type }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        if (!type) {
          type = 'ARTICLE'
        }
        if (type !== 'ARTICLE') {
          const postExists = await ctx.prisma.$exists.post({ type })
          if (postExists) {
            throw new ApolloError(`Post with type ${type} already exists`, 'POST_ERROR')
          }
        }
        const post = await ctx.prisma.createPost({
          title,
          body,
          published: false,
          author: {
            connect: { id: ctx.user.id }
          },
          type,
          slug: _.kebabCase(title)
        })
        await processImages(ctx, post.id, images)
        return post
      }
    })
    t.field('updatePost', {
      type: 'Post',
      args: {
        id: idArg(),
        title: stringArg(),
        body: arg({ type: 'Json' }),
        images: arg({ type: 'ImageInput', list: true })
      },
      resolve: async (parent, { id, title, body, images }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        const postExists = await ctx.prisma.$exists.post({
          id,
          author: { id: ctx.user.id }
        })
        if (!postExists) {
          throw new ApolloError('Post not found or you\'re not the author', 'RIGHTS_ERROR')
        }
        const post = await ctx.prisma.updatePost({
          where: { id },
          data: {
            title,
            body,
            slug: _.kebabCase(title)
          }
        })
        await processImages(ctx, id, images)
        return post
      }
    })
    t.field('deletePost', {
      type: 'Post',
      args: {
        id: idArg()
      },
      resolve: async (parent, { id }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        const postExists = await ctx.prisma.$exists.post({
          id,
          author: { id: ctx.user.id }
        })
        if (!postExists) {
          throw new ApolloError('Post not found or you\'re not the author', 'RIGHTS_ERROR')
        }
        await removeImagesFromDisk(ctx, id)
        return ctx.prisma.deletePost({ id })
      }
    })
    t.field('publish', {
      type: 'Post',
      args: {
        id: idArg()
      },
      resolve: async (parent, { id }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        const postExists = await ctx.prisma.$exists.post({
          id,
          author: { id: ctx.user.id }
        })
        if (!postExists) {
          throw new ApolloError('Post not found or you\'re not the author', 'RIGHTS_ERROR')
        }
        return ctx.prisma.updatePost({
          where: { id },
          data: { published: true }
        })
      }
    })
    t.field('unPublish', {
      type: 'Post',
      args: {
        id: idArg()
      },
      resolve: async (parent, { id }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        const postExists = await ctx.prisma.$exists.post({
          id,
          author: { id: ctx.user.id }
        })
        if (!postExists) {
          throw new ApolloError('Post not found or you\'re not the author', 'RIGHTS_ERROR')
        }
        return ctx.prisma.updatePost({
          where: { id },
          data: { published: false }
        })
      }
    })
    t.field('updateUser', {
      type: 'User',
      args: {
        username: stringArg(),
        bio: stringArg()
      },
      resolve: async (parent, { username, bio }, ctx) => {
        if (!ctx.user) {
          throw new AuthenticationError('Not authorized')
        }
        return ctx.prisma.updateUser({
          where: { id: ctx.user.id },
          data: { username, bio }
        })
      }
    })
  }
})*/
