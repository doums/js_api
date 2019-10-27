import { Talk, User } from '../generated/prisma-client'
import { Context } from '../types'

const Post = {
  author (root: any, args: any, ctx: Context): User {
    return ctx.prisma.post({ id: root.id }).author()
  },

  talk (root: any, args: any, ctx: Context): Talk {
    return ctx.prisma.post({ id: root.id }).talk()
  }
}

export default Post