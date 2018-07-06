import Game from '../../models/game';

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

export default GameController;
