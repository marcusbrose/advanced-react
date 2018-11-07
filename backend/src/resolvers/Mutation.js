const Mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: { ...args }
    }, info)
    return item
  },

  async updateItem(parent, args, ctx, info) {
    const updates = { ...args }
    delete updates.id
    const item = await ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id,
      }
    }, info)
    return item
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id title }`)
    // 2. check permissions
    // TODO
    // 3. delete it
    return ctx.db.mutation.deleteItem({ where }, info)
  }
};

module.exports = Mutations;
