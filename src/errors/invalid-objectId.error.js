class InvalidObjectIdError extends Error {
  constructor(message) {
    message = message || "Invalid objectId passed!";
    super(message);
    this.name = 'InvalidObjectIdError';

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = InvalidObjectIdError;
