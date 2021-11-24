const { InvalidRequestParametersError } = require("../utils/errors");
const { StatusCodes } = require("http-status-codes");

class BaseMiddleware {
  constructor() {
    this.validatePaginatedParameters =
      this.validatePaginatedParameters.bind(this);
    this.validateRequestBody = this.validateRequestBody.bind(this);
  }
  validatePaginatedParameters(req, res, next) {
    let { page, limit } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page)) {
      req.query.page = 1;
    }

    if (isNaN(limit)) {
      req.query.limit = 10;
    }

    if (page < 0) {
      return next(new InvalidRequestParametersError("Invalid page"));
    }

    if (limit < 0) {
      return next(new InvalidRequestParametersError("Invalid limit"));
    }

    return next();
  }

  validateRequestBody(req, res, next) {
    if (!req.body || !req.body.title) {
      return res.status(StatusCodes.BAD_REQUEST).json({});
    }
    return next();
  }
}

module.exports = new BaseMiddleware();
