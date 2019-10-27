import { Post, User } from '../generated/prisma-client'
import { Context } from '../types'

const Talk = {
  activeUsers (root: any, args: any, ctx: Context): Promise<Array<User>> {
    return ctx.prisma.talk({ id: root.id }).activeUsers()
  },

  posts (root: any, args: any, ctx: Context): Promise<Array<Post>> {
    return ctx.prisma.talk({ id: root.id }).posts()
  }
}

export default Talk