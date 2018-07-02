/**
 * Redirect users to /#!/app (forcing Angular to reload the page)
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 *
 * @returns {undefined} - undefined
 */
exports.play = (req, res) => {
  if (Object.keys(req.query)[0] === 'custom') {
    res.redirect('/#!/app?custom');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Redirect users to /#!/app (forcing Angular to reload the page)
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 *
 * @returns {undefined} - undefined
 */
exports.render = (req, res) => {
  res.render('index', {
    user: req.user ? JSON.stringify(req.user) : 'null'
  });
};
