/* eslint camelcase: 0 max-len: 0 */
/* eslint no-unused-vars: 0 func-names: 0 */

/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
import _ from 'underscore';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import uniqueFieldValidator from 'mongoose-unique-validator';
import findOrCreate from 'mongoose-findorcreate';

const authTypes = ['github', 'twitter', 'facebook', 'google'];
const { Schema } = mongoose;

/**
 * User Schema
 */
const UserSchema = new Schema({
  name: { type: String, required: [true, 'Name cannot be blank'] },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email cannot be blank']
  },
  username: {
    type: String,
    unique: true,
    required: [true, 'Username cannot be blank']
  },
  profileImage: {
    type: String,
    default: 'https://res.cloudinary.com/defxlxmvc/image/upload/v1530704423/profileImage.png'
  },
  provider: String,
  avatar: String,
  premium: Number, // null or 0 for non-donors, 1 for everyone else (for now)
  donations: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  friends: [new Schema({
    username: { type: String, required: [true, 'Username cannot be blank'] },
    email: { type: String, required: [true, 'Email cannot be blank'] }
  }, { _id: false, id: false })],
  hashedPassword: {
    type: String,
    required: [true, 'Password is required']
  },
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  gamesWon: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function (password) {
  this._password = password;
  this.hashedPassword = this.encryptPassword(password);
}).get(function () {
  return this._password;
});

/**
 * Validations
 *
 * @param {string} value - string to validate
 * @returns {undefined} - undefined
 */
const validatePresenceOf = value => value && value.length;

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name').validate(function (name) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  name = name.trim();
  this.name = name;
  return !validator.isEmpty(name);
}, 'Name cannot be blank');

UserSchema.path('email').validate(function (email) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  email = email.trim().toLowerCase();
  this.email = email;
  return !validator.isEmpty(email) && validator.isEmail(email);
}, 'Email is incorrect');

UserSchema.path('username').validate(function (username) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  username = username.trim().toLowerCase();
  this.username = username;
  return (
    !validator.isEmpty(username)
    && !validator.isInt(username)
    && validator.isAlphanumeric(username)
  );
}, 'Username is incorrect');

UserSchema.path('hashedPassword').validate(function (hashedPassword) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return hashedPassword.length;
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
  if (!this.isNew) return next();

  if (
    !validatePresenceOf(this.password)
    && authTypes.indexOf(this.provider) === -1
  ) {
    next(new Error('Invalid password'));
  } else { next(); }
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @api public
     *@returns {Boolean} -
     */
  authenticate(plainText) {
    if (!plainText || !this.hashedPassword) {
      return false;
    }
    return bcrypt.compareSync(plainText, this.hashedPassword);
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String} - returns hashed password
   * @api public
  */
  encryptPassword(password) {
    if (!password) return '';
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }
};

// Add unique field validation plugin
UserSchema.plugin(uniqueFieldValidator, { message: '{PATH} already exist!' });
UserSchema.plugin(findOrCreate);

export default mongoose.model('User', UserSchema);
