import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const secret = process.env.SECRET;

/**
* Generic authenticate user middleware
*
* @param {object} req - Express request object
* @param {object} res - Express response object
* @param {Function} next - Express middlware next function
* @returns {object|func} - Error Object or next()
*/
export const authenticate = (req, res, next) => {
  const token = req.body.token || req.query.token
  || req.headers['x-access-token'];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Token not provided'
    });
  }

  jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'User authorization token is expired'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Failed to authenticate token'
      });
    }

    req.decoded = decoded;
    return next();
  });
};

/**
* Generic require login routing middleware
*
* @param {object} req - Express request object
* @param {object} res - Express response object
* @param {Function} next - Express middlware next function
* @returns {undefined} - undefined
*/
exports.requiresLogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

/**
* User authorizations routing middleware
*/
exports.user = {
  hasAuthorization(req, res, next) {
    if (req.profile.id !== req.user.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
  }
};

/**
* Article authorizations routing middleware
*/
// exports.article = {
//     hasAuthorization: function(req, res, next) {
//         if (req.article.user.id != req.user.id) {
//             return res.send(401, 'User is not authorized');
//         }
//         next();
//     }
// };
