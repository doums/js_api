const Post = {
  author(root, args, ctx) {
    return ctx.prisma.post({ id: root.id }).author()
  },

  talk(root, args, ctx) {
    return ctx.prisma.post({ id: root.id }).talk()
  }
}

export default Post