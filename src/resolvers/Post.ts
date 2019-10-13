import { Talk, User } from '../generated/prisma-client'

const Post = {
  author (root, args, ctx): User {
    return ctx.prisma.post({ id: root.id }).author()
  },

  talk (root, args, ctx): Talk {
    return ctx.prisma.post({ id: root.id }).talk()
  }
}

export default Post