import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../../models/user';

dotenv.config();

/**
 * Handles user signup and login operations
 * @exports
 * @class UserApiController
 */
class UsersApiController {
  /**
   *
   * Creates user
   *
   * @static
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {object} next Express next object
   * @returns {object} returns token
   */
  static signup(req, res, next) {
    const newUser = new User(req.body);
    newUser.save((err, response) => {
      if (err) return next(err);

      if (response) {
        // Generate token
        jwt.sign(
          {
            id: response._id,
            email: response.email,
            username: response.username
          },
          process.env.SECRET,
          { expiresIn: '48h' },
          (err, token) => {
            if (err) return next(err);
            res.status(201).json({
              success: true,
              errors: {},
              message: 'user created successfully!',
              token
            });
          }
        );
      }
    });
  }

  /**
   *
   * Logs user in
   *
   * @static
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {object} next Express next object
   * @returns {object} returns token
   */
  static login(req, res, next) {
    const {
      email,
      password
    } = req.body;

    let error;

    if (email && password) {
      const query = User.findOne({
        email: email.trim().toLowerCase()
      });

      query.exec((err, found) => {
        if (err) return next(err);

        if (found) {
          // compare password and get token
          const pswdMatch = found.authenticate(password);

          if (pswdMatch) {
            jwt.sign(
              {
                id: found._id,
                email: found.email,
                username: found.username
              },
              process.env.SECRET,
              { expiresIn: '48h' },
              (err, token) => {
                if (err) return next(err);

                res.status(200).json({
                  success: true,
                  errors: {},
                  message: 'Login successful!',
                  token
                });
              }
            );
          }

          if (!pswdMatch) {
            error = new Error('Email or Password is incorrect!');
            error.status = 400;
            return next(error);
          }
        }

        if (!found) {
          error = new Error('Email or Password is incorrect!');
          error.status = 400;
          return next(error);
        }
      });
    } else {
      error = new Error('Email and Password are required!');
      error.status = 400;
      return next(error);
    }
  }

  /**
   *
   * Gets User Profile with User Game Data
   *
   * @static
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {object} next Express next object
   * @returns {object} User
   */
  static profile(req, res, next) {
    const { email } = req.decoded;

    User.findOne({
      email: email.trim().toLowerCase()
    }, '-_id -__v -hashedPassword -donations').exec((err, foundUser) => {
      if (err) return next(err);

      if (!foundUser) {
        const error = new Error('User does not exist!');
        error.status = 404;
        return next(error);
      }

      res.json({
        success: true,
        user: foundUser
      });
    });
  }

  /**
   *
   * Adds User Donation
   * req.body = {
   *   amount: any
   * }
   *
   * @static
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {object} next Express next object
   * @returns {object} success object
   */
  static addDonation(req, res, next) {
    const { email } = req.decoded;

    User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { $push: { donations: req.body } },
      (err) => {
        if (err) return next(err);

        res.json({
          success: true,
          message: 'Donation Successful'
        });
      }
    );
  }

  /**
   *
   * Gets all User's Donation
   *
   * @static
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {object} next Express next object
   * @returns {object} success object
   */
  static getDonations(req, res, next) {
    const { email } = req.decoded;

    User.findOne(
      {
        email: email.trim().toLowerCase()
      },
      '-_id -__v -hashedPassword -gamesWon -profileImage'
    ).exec((err, user) => {
      if (err) return next(err);

      res.json({
        success: true,
        user
      });
    });
  }
}

export default UsersApiController;
