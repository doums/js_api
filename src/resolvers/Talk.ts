const Talk = {
  activeUsers(root, args, ctx) {
    return ctx.prisma.talk({ id: root.id }).activeUsers()
  },

  posts(root, args, ctx) {
    return ctx.prisma.talk({ id: root.id }).posts()
  }
}

export default Talk