import Question from '../models/question';

/**
 * @class QuestionsController
 */
class QuestionsController {
  /**
   * Find question by id
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express middleware next function
   * @param {string} id - Answer id
   *
   * @returns {undefined} - undefined
   */
  static question(req, res, next, id) {
    Question.load(id, (err, question) => {
      if (err) return next(err);
      if (!question) return next(new Error(`Failed to load question ${id}`));
      req.question = question;
      next();
    });
  }

  /**
   * Show a question
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static show(req, res) {
    res.jsonp(req.question);
  }

  /**
   * List of Questions
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static all(req, res) {
    Question.find({ official: true, numAnswers: { $lt: 3 } })
      .select('-_id').exec((err, questions) => {
        if (err) {
          res.render('error', {
            status: 500
          });
        } else {
          res.jsonp(questions);
        }
      });
  }

  /**
   * List of Questions (for Game class)
   *
   * @param {Function} cb - Callback function
   * @param {object} region
   * @returns {undefined} - undefined
   */
  static allQuestionsForGame(cb, region) {
    if (region) {
      Question.find({ official: true, numAnswers: { $lt: 3 }, region })
        .select('-_id').exec((err, questions) => {
          if (!err) {
            cb(questions);
          }
        });
    } else {
      Question.find({ official: true, numAnswers: { $lt: 3 } })
        .select('-_id').exec((err, questions) => {
          if (!err) {
            cb(questions);
          }
        });
    }
  }
}

export default QuestionsController;
