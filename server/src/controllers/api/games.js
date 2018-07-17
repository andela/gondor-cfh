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
    }, '-__v -hashedPassword -donations')
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
    }).exec((err, games) => {
      if (err) return next(err);

      res.json({ success: true, games });
    });
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {object} - object
   */
  static saveGame(req, res) {
    const { winner } = req.body;
    User.findOneAndUpdate(
      { username: winner },
      {
        $inc: {
          gamesWon: 1
        }
      }, (err, res) => res
    );
    const gameDetails = new Game(req.body);
    gameDetails.save()
      .then((game) => {
        res.status(201).json({
          success: true,
          message: 'Game saved successfully',
          game
        });
      })
      .catch(() => {
        res.status(400).json({
          success: false,
          message: 'Game Details not saved'
        });
      });
  }
}

export default GamesController;
