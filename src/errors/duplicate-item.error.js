class DuplicateItemError extends Error {
    constructor(message) {
      message = message || "Duplicate item, unique index failed.";
      super(message);
      this.name = 'DuplicateItemError';
  
      Error.captureStackTrace(this, this.constructor);
    }
}
  
module.exports = DuplicateItemError;
