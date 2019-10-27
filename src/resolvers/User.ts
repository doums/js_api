import { Post, Talk } from '../generated/prisma-client'
import { Context } from '../types'

const User = {
  activeTalks (root: any, args: any, ctx: Context): Promise<Array<Talk>> {
    return ctx.prisma.user({ id: root.id }).activeTalks()
  },

  posts (root: any, args: any, ctx: Context): Promise<Array<Post>> {
    return ctx.prisma.user({ id: root.id }).posts()
  }
}

export default User