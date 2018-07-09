/* eslint prefer-template: 0 */
import Game from '../../models/game';
import User from '../../models/user';

/**
 * @class GameController
 */
class GameController {
  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {object} - object
   */
  static saveGame(req, res) {
    const { winner } = req.body;
    const now = new Date();
    const monthList = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const date = monthList[now.getMonth()]
    + ' ' + now.getDate() + ', ' + now.getFullYear();
    User.findOneAndUpdate(
      { username: winner },
      {
        $inc: {
          gamesWon: 1
        }
      }, (err, res) => res
    );
    const gameDetails = new Game({ ...req.body, date });
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

export default GameController;
