const notFound = (req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    data: null,
    message: status === 500 ? 'Internal server error' : err.message
  });
};

module.exports = { notFound, errorHandler };
