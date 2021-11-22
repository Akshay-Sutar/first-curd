const { PathNotFoundError } = require('../utils/errors');

const NotFoundMiddleware = (req, res, next) => {
    return next(new PathNotFoundError(`Path not found - ${req.originalUrl}`))
};

module.exports = NotFoundMiddleware;
