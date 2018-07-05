import dotenv from 'dotenv';

dotenv.config();

/**
 * Handles errors
 *
 * @param {Object} err error object
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Object} next Express next object
 * @param {String} env Node environment
 * @return {json} res.json
 */
const errorHandler = (
  err,
  req,
  res,
  next,
  env = process.env.NODE_ENV
) => {
  // check if unique constraint error
  if (err.name === 'ValidationError') {
    const customErrors = {};
    Object.keys(err.errors).forEach((error) => {
      customErrors[error] = err.errors[error].message;
    });
    return res.status(400).json({
      success: false,
      message: err.name,
      errors: customErrors
    });
  }

  if (env === 'production') {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message,
    errors: err.errors
  });
};

export default errorHandler;
