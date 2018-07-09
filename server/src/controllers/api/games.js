import User from '../../models/user';

/**
 * Handles user signup and login operations
 * @exports
 * @class UserApiController
 */
class GamesController {
  /**
   *
   * Gets Game Leaderboard
   *
   * @static
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {object} next Express next object
   * @returns {object} leaderboard
   */
  static leaderboard(req, res, next) {
    return User.find({ gamesWon: { $gte: 1 } }, '-_id -__v -hashedPassword')
      .limit(10)
      .sort({ gamesWon: -1 })
      .exec((err, users) => {
        if (err) return next(err);

        return res.json({ success: true, users });
      });
  }
}

export default GamesController;
