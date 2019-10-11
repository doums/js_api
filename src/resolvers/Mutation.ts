import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { ApolloError, AuthenticationError } from 'apollo-server'
import * as _ from 'lodash'

const Mutation = {
  async signup(root, args, ctx) {
    const password = await bcrypt.hash(args.password, 10)
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
  },

  createTalk(root, { name, description }, ctx) {
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

  async joinTalk(root, { id }, ctx) {
    const { user } = ctx
    if (!user) {
      throw new AuthenticationError('Not authorized')
    }
    const talkExists = await ctx.prisma.$exists.talk({ id })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${id}"`, 'USER_ERROR')
    }
    const activeUsers = await ctx.prisma.talk({ id }).activeUsers()
    if (activeUsers.find(activeUser => activeUser.id == user.id)) {
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

  async leaveTalk(root, { id }, ctx) {
    const { user } = ctx
    if (!user) {
      throw new AuthenticationError('Not authorized')
    }
    const talkExists = await ctx.prisma.$exists.talk({ id })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${id}"`, 'USER_ERROR')
    }
    const activeUsers = await ctx.prisma.talk({ id }).activeUsers()
    if (!activeUsers.find(activeUser => activeUser.id == user.id)) {
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

  async createPost(root, { text, talkId }, ctx) {
    if (!ctx.user) {
      throw new AuthenticationError('Not authorized')
    }
    const talkExists = await ctx.prisma.$exists.talk({ id: talkId })
    if (!talkExists) {
      throw new ApolloError(`No talk found for id "${talkId}"`, 'USER_ERROR')
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

  async updatePost(root, { id, text }, ctx) {
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

  async deletePost(root, { id }, ctx) {
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

export default Mutation