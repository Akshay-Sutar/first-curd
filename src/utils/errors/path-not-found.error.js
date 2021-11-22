class PathNotFoundError extends Error {
  constructor(message) {
    message = message || "Path not found!";
    super(message);
    this.name = "PathNotFoundError";

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = PathNotFoundError;
