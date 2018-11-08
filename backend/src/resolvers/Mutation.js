const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')

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
  },

  async signup(parent, args, ctx, info) {
    // lowercase email
    args.email = args.email.toLowerCase()
    // hash password
    const password = await bcrypt.hash(args.password, 10)
    // create user in db
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] },
      }
    }, info)
    // create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // set the JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true, // important! prevent access from external js or browser extensions
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })
    return user
  },

  async signin(parent, { email, password }, ctx, info) {
    // check email
    const user = await ctx.db.query.user({ where: { email }})
    if ( ! user) {
      throw new Error(`No user found form email ${email}`)
    }
    // verify password
    const valid = await bcrypt.compare(password, user.password)
    if ( ! valid) {
      throw new Error(`Invalid password`)
    }
    // create JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // set the JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true, // important! prevent access from external js or browser extensions
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })
    return user
  },

  async signout(parent, ags, ctx, info) {
    ctx.response.clearCookie('token')
    return {
      message: 'Goodbye!',
    }
  },

  async requestReset(parent, { email }, ctx, info) {
    // check user
    const user = await ctx.db.query.user({ where: { email }})
    if ( ! user) {
      throw new Error(`No user found form email ${email}`)
    }
    // set reset token and expiry
    const resetToken = (await promisify(randomBytes)(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60 // 1 hour
    const response = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    })
    // email them the token

    return {
      message: 'see you soon!',
    }
  },

  async resetPassword(parent, args, ctx, info) {
    // check if passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error(`Your passwords don't match`)
    }
    // check reset token and expiry
    const [user] = await ctx.db.query.users({
      where: { 
        resetToken: args.resetToken, 
        resetTokenExpiry_gte: Date.now(),
      }
    })
    if ( ! user) {
      throw new Error(`This token is either invalid or expired!`)
    }
    // hash new password
    const password = await bcrypt.hash(args.password, 10)
    // save new password to user and reset reset fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      }
    })
    // generate jwt
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    // set JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true, // important! prevent access from external js or browser extensions
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })
    // return new user
    return updatedUser
  }
}

module.exports = Mutations;
