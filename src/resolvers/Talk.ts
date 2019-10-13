import { Post, User } from '../generated/prisma-client'

const Talk = {
  activeUsers (root, args, ctx): Promise<Array<User>> {
    return ctx.prisma.talk({ id: root.id }).activeUsers()
  },

  posts (root, args, ctx): Promise<Array<Post>> {
    return ctx.prisma.talk({ id: root.id }).posts()
  }
}

export default Talk