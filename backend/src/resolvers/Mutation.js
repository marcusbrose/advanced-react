const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { transport, makeANiceEmail } = require('../mail')
const { hasPermission } = require('../utils')

const Mutations = {

  async createItem(parent, args, ctx, info) {
    if ( ! ctx.request.userId) {
      throw new Error(`You must be logged in to do that!`)
    }
    const item = await ctx.db.mutation.createItem({
      data: {
        // create a relationship between Item and User
        user: {
          connect: {
            id: ctx.request.userId,
          },
        },
        ...args,
      }
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
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`)
    // 2. check permissions
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN','ITEMDELETE'].includes(permission))
    if ( ! ownsItem && ! hasPermission) {
      throw new Error('Not allowed')
    }
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
    const mailResponse = await transport.sendMail({
      from: 'contact@marcusbrose.com',
      to: user.email,
      subject: 'Your password reset token',
      html: makeANiceEmail(
        `Your password reset token is here! 
        \n\n 
        <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset</a>`
      ),
    })

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
  },

  async updatePermissions(parent, args, ctx, info) {
    // check if logged in
    if ( ! ctx.request.userId) {
      throw new Error(`You must be logged in to do that!`)
    }
    // query current user
    const currentUser = await ctx.db.query.user({ 
      where: { id: ctx.request.userId }
    }, info)
    // check permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])
    // update permissions
    return await ctx.db.mutation.updateUser({
      data: {
        permissions: { set: args.permissions },
      },
      where: {
        id: args.userId,
      }
    },
    info)
  },

  async addToCart(parent, args, ctx, info) {
    // check if logged in
    const userId = ctx.request.userId
    if ( ! userId) {
      throw new Error(`You must be logged in to do that!`)
    }
    // query users cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      }
    })
    // check if item already in cart
    if (existingCartItem) {
      // increment 
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity+1 }
      }, info)
    }
    // create fresh CartItem
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id },
        },
        quantity: 1,
      }
    }, info)
  },

  async removeFromCart(parent, args, ctx, info) {
    // find the CartItem
    const cartItem = await ctx.db.query.cartItem({ where: { id: args.id }}, '{ id, user { id }}')
    // make sure we found an item
    if ( ! cartItem) {
      throw new Error('No cart item found')
    }
    // make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('Cheatin huhhh')
    }
    // delete cartItem
    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id },
    }, info)
  },
}

module.exports = Mutations
