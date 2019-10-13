import { Post, Talk } from '../generated/prisma-client'

const User = {
  activeTalks (root, args, ctx): Promise<Array<Talk>> {
    return ctx.prisma.user({ id: root.id }).activeTalks()
  },

  posts (root, args, ctx): Promise<Array<Post>> {
    return ctx.prisma.user({ id: root.id }).posts()
  }
}

export default User