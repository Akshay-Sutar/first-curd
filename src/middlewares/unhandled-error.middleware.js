const { StatusCodes } = require("http-status-codes");

const { InvalidObjectIdError, InvalidRequestParametersError, DuplicateItemError, PathNotFoundError } = require("../utils/errors");

const UnhandledErrorMiddleware = (err, req, res, next) => {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let type = 'Server error';
  
    if (err instanceof InvalidObjectIdError) {
      statusCode = StatusCodes.BAD_REQUEST;
      type = 'Invalid object Id';
    } else if (err instanceof InvalidRequestParametersError) {
      statusCode = StatusCodes.BAD_REQUEST;
      type = 'Invalid pagination parameters';
    } else if (err instanceof DuplicateItemError) {
      statusCode = StatusCodes.CONFLICT;
      type = 'Duplicate item error';
    } else if (err instanceof PathNotFoundError) {
        statusCode = StatusCodes.NOT_FOUND;
        type = 'Path not found';
    }
  
    return res.status(statusCode).json({ type, messsage: err.messsage });
};

module.exports = UnhandledErrorMiddleware;
