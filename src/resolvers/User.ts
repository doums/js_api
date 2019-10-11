const User = {
  activeTalks(root, args, ctx) {
    return ctx.prisma.user({ id: root.id }).activeTalks()
  },

  posts(root, args, ctx) {
    return ctx.prisma.user({ id: root.id }).posts()
  }
}

export default User