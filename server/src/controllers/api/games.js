import User from '../../models/user';
import Game from '../../models/game';

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
   * Leader board consists of the first 10 players with the
   * highest scores on the platform. We are querying the db to get
   * players with scores greater than 1 sorted in descending order
   */
  static leaderboard(req, res, next) {
    return User.find({
      gamesWon: { $gte: 1 }
    }, '-_id -__v -hashedPassword -donations')
      .limit(10)
      .sort({ gamesWon: -1 })
      .exec((err, users) => {
        if (err) return next(err);

        return res.json({ success: true, players: users });
      });
  }

  /**
   *
   * Gets Game History for a User
   *
   * @static
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {object} next Express next object
   * @returns {object} game history
   */
  static history(req, res, next) {
    const { username } = req.decoded;

    return Game.find({
      players: username
    }, '-_id').exec((err, games) => {
      if (err) return next(err);

      res.json({ success: true, games });
    });
  }
}

export default GamesController;
