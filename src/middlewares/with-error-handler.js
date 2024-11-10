const withErrorHandler = (...handlers) => {
  return handlers.map((handler) => {
    return async (req, res, next) => {
      return Promise.resolve(handler(req, res, next)).catch(next);
    };
  });
};

module.exports = { withErrorHandler };
