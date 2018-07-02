import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../../models/user';

dotenv.config();

/**
 * Handles user signup and login operations
 * @exports
 * @class UserApiController
 */
const UsersApiController = {
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
  signup(req, res, next) {
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
              message: 'user created successfully!',
              token
            });
          }
        );
      }
    });
  }
};

export default UsersApiController;
