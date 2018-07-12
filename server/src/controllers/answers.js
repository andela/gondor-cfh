import Answer from '../models/answer';

/**
 * @class AnswersController
 */
class AnswersController {
  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express middleware next function
   * @param {string} id - Answer id
   *
   * @returns {undefined} - undefined
   */
  static answer(req, res, next, id) {
    Answer.load(id, (err, answer) => {
      if (err) return next(err);
      if (!answer) return next(new Error(`Failed to load answer ${id}`));
      req.answer = answer;
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
  static show(req, res) {
    res.jsonp(req.answer);
  }

  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static all(req, res) {
    Answer.find({ official: true }).select('-_id').exec((err, answers) => {
      if (err) {
        res.render('error', {
          status: 500
        });
      } else {
        res.jsonp(answers);
      }
    });
  }

  /**
   *
   * @param {Function} cb - Callback function
   * @param {object} region - region
   * @returns {undefined} - undefined
   */
  static allAnswersForGame(cb, region) {
    if (region) {
      Answer.find({ official: true, region })
        .select('-_id').exec((err, answers) => {
          if (!err) {
            cb(answers);
          }
        });
    } else {
      Answer.find({ official: true }).select('-_id').exec((err, answers) => {
        if (!err) {
          cb(answers);
        }
      });
    }
  }
}

export default AnswersController;
