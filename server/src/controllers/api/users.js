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

      query.exec((err, userFound) => {
        if (err) return next(err);

        if (userFound) {
          // compare password and get token
          const pswdMatch = userFound.authenticate(password);

          if (pswdMatch) {
            jwt.sign(
              {
                id: userFound._id,
                email: userFound.email,
                username: userFound.username
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

        if (!userFound) {
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
}

export default UsersApiController;
