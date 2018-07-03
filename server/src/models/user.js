/* eslint camelcase: 0 */
/* eslint no-unused-vars: 0 func-names: 0 */

/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
import _ from 'underscore';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import uniqueFieldValidator from 'mongoose-unique-validator';

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
  provider: String,
  avatar: String,
  premium: Number, // null or 0 for non-donors, 1 for everyone else (for now)
  donations: [],
  hashed_password: {
    type: String,
    required: [true, 'Password is required']
  },
  facebook: {},
  twitter: {},
  github: {},
  google: {}
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function (password) {
  this._password = password;
  this.hashed_password = this.encryptPassword(password);
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

UserSchema.path('hashed_password').validate(function (hashed_password) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return hashed_password.length;
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
    if (!plainText || !this.hashed_password) {
      return false;
    }
    return bcrypt.compareSync(plainText, this.hashed_password);
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

export default mongoose.model('User', UserSchema);