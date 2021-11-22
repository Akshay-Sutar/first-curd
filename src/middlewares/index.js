const BaseMiddleware = require('./base.middleware');
const NotFoundMiddleware = require('./not-found.middleware');
const UnhandledErrorMiddleware = require('./unhandled-error.middleware');

module.exports = {
    BaseMiddleware,
    NotFoundMiddleware,
    UnhandledErrorMiddleware
};
