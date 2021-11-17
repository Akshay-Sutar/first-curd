class InvalidRequestParametersError extends Error {
  constructor(message) {
    message = message || "Invalid request parameters";
    super(message);
    this.name = 'InvalidRequestParametersError';

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = InvalidRequestParametersError;
