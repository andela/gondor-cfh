 import { avatars } from './avatars';
import User from '../models/user';

/**
 * @class UsersController
 */
class UsersController {
  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static authCallback(req, res) {
    res.redirect('/chooseavatars');
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static signin(req, res) {
    if (!req.user) {
      res.redirect('/#!/signin?error=invalid');
    } else {
      res.redirect('/#!/app');
    }
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static signup(req, res) {
    if (!req.user) {
      res.redirect('/#!/signup');
    } else {
      res.redirect('/#!/app');
    }
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static signout(req, res) {
    req.logout();
    res.redirect('/');
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static session(req, res) {
    res.redirect('/');
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static checkAvatar(req, res) {
    if (req.user && req.user._id) {
      User.findOne({
        _id: req.user._id
      })
        .exec((err, user) => {
          if (user.avatar !== undefined) {
            res.redirect('/#!/');
          } else {
            res.redirect('/#!/choose-avatar');
          }
        });
    } else {
      // If user doesn't even exist, redirect to /
      res.redirect('/');
    }
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express middleware next function
   * @returns {undefined} - undefined
   */
  static create(req, res, next) {
    if (req.body.name && req.body.password && req.body.email) {
      User.findOne({
        email: req.body.email
      }).exec((err, existingUser) => {
        if (!existingUser) {
          const user = new User(req.body);
          // Switch the user's avatar index to an actual avatar url
          user.avatar = avatars[user.avatar];
          user.provider = 'local';
          user.save((err) => {
            if (err) {
              return res.render('/#!/signup?error=unknown', {
                errors: err.errors,
                user
              });
            }
            req.logIn(user, (err) => {
              if (err) return next(err);
              return res.redirect('/#!/');
            });
          });
        } else {
          return res.redirect('/#!/signup?error=existinguser');
        }
      });
    } else {
      return res.redirect('/#!/signup?error=incomplete');
    }
  }

  /**
   * Update the current user's profile to include the avatar choice they've made
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static avatars(req, res) {
    if (req.user && req.user._id && req.body.avatar !== undefined
      && /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
      User.findOne({
        _id: req.user._id
      })
        .exec((err, user) => {
          user.avatar = avatars[req.body.avatar];
          user.save();
        });
    }
    return res.redirect('/#!/app');
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static addDonation(req, res) {
    if (req.body && req.user && req.user._id) {
      // Verify that the object contains crowdrise data
      if (req.body.amount
        && req.body.crowdrise_donation_id
        && req.body.donor_name) {
        User.findOne({
          _id: req.user._id
        })
          .exec((err, user) => {
          // Confirm that this object hasn't already been entered
            let duplicate = false;
            for (let i = 0; i < user.donations.length; i += 1) {
              if (user.donations[i].crowdrise_donation_id
                === req.body.crowdrise_donation_id) {
                duplicate = true;
              }
            }
            if (!duplicate) {
              console.log('Validated donation');
              user.donations.push(req.body);
              user.premium = 1;
              user.save();
            }
          });
      }
    }
    res.send();
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static show(req, res) {
    const user = req.profile;

    res.render('users/show', {
      title: user.name,
      user
    });
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static me(req, res) {
    res.jsonp(req.user || null);
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express middleware next function
   * @param {string} id - Answer id
   *
   * @returns {undefined} - undefined
   */
  static user(req, res, next, id) {
    User
      .findOne({
        _id: id
      })
      .exec((err, user) => {
        if (err) return next(err);
        if (!user) return next(new Error(`Failed to load User ${id}`));
        req.profile = user;
        next();
      });
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static userSearch(req, res) {
    const { search } = req.query;
    if (!search) {
      return res.status(404).json({
        message: 'No matching user',
        errors: {
          users: {
            name: 'No matching user',
            email: 'No matching user'
          }
        }
      });
    }
    User.find()
      .or([
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ])
      .exec((err, users) => {
        if (err) {
          return res.status(500).json({
            message: 'Database Error'
          });
        }
        if (users.length === 0) {
          return res.status(404).json({
            message: 'No matching user',
            errors: {
              users: {
                name: 'No matching user',
                email: 'No matching user'
              }
            }
          });
        }
        const matchedUsers = users.map(user => ({
          email: user.email,
          name: user.name
        }));
        return res.status(200).json({
          users: matchedUsers,
          message: 'success'
        });
      });
  }
}

export default UsersController;
