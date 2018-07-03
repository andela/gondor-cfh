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
    const message = [];
    Object.keys(err.errors).forEach((error) => {
      message.push(`${err.errors[error].message}`);
    });
    return res.status(409).json({
      success: false,
      error: err.name,
      message
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
    error: err.errors
  });
};

export default errorHandler;
