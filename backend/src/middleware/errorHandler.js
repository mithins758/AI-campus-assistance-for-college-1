// Centralized error handler. Keeps responses consistent and hides secrets.
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const status = err.statusCode || err.status || 500;
  const message =
    status >= 500 ? 'Internal server error' : err.message || 'Request failed';

  if (status >= 500) {
    // Log server-side details without leaking them to the client.
    console.error('Unhandled error:', err.message);
  }

  const payload = { success: false, message };
  // In development, include a controlled error detail (no secrets).
  if (process.env.NODE_ENV !== 'production' && err.message && status < 500) {
    payload.error = err.message;
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;
