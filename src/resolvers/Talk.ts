import { Post } from '../generated/prisma-client'
import { Context } from '../types'

const Talk = {
  posts (root: any, args: any, ctx: Context): Promise<Array<Post>> {
    return ctx.prisma.talk({ id: root.id }).posts()
  }
}

export default Talk
