import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

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
  },
  isAuthorized(req, res, next) {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader === 'undefined') {
      return res.status(401).send({
        message: 'No token provided.'
      });
    }
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    jwt.verify(token, process.env.TOKEN_PASSWORD, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: err.message
        });
      }
      req.decoded = decoded;
    });
    return next();
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
