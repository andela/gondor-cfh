export default {
  /**
  * Generic authenticate user middleware
  *
  * @param {object} req - Express request object
  * @param {object} res - Express response object
  * @param {Function} next - Express middlware next function
  * @returns {object|func} - Error Object or next()
  */
  validateDonation: (req, res, next) => {
    const errors = { amount: null };

    if (!req.body.amount || req.body.amount <= 0) {
      errors.amount = 'Amount must be a number greater than 0';
    } else if (Number.isNaN(Number(req.body.amount))) {
      errors.amount = 'Amount must be a number';
    }

    if (errors.amount) return res.status(400).json({ success: false, errors });

    next();
  }
};
