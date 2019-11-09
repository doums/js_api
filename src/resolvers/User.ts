import { Post } from '../generated/prisma-client'
import { Context } from '../types'

const User = {
  posts (root: any, args: any, ctx: Context): Promise<Array<Post>> {
    return ctx.prisma.user({ id: root.id }).posts()
  }
}

export default User
