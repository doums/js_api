const postSubscribe = (root, args, ctx) => {
  console.log("---------------")
  console.log(ctx)
  console.log("---------------")
  return ctx.prisma.$subscribe
    .post({
      mutation_in: ['CREATED', 'UPDATED', 'DELETED']
    })
    .node()
}

const Subscription = {
  postSub: {
    subscribe: postSubscribe,
    resolve: payload => payload
  }
}

export default Subscription