// System module

// NPM/yarn module
const express = require("express");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");

// Custom module
const config = require("./config");
const convertErrorToObject = require("./lib/error");
const { InvalidObjectIdError, InvalidRequestParametersError, DuplicateItemError } = require("./errors");

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception - ", err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection - ", err.stack);
  process.exit(1);
});

const app = express();
require("./config/database");

// Pipeline
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res, next) => {
  return res.json({ message: "Hello world!" });
});

app.use(require("./routes"));

app.use("*", (req, res, next) => {
  return res.status(StatusCodes.NOT_FOUND).json({ path: req.path });
});

app.use((err, req, res, next) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Server error';

  if (err instanceof InvalidObjectIdError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid object Id';
  } else if (err instanceof InvalidRequestParametersError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid pagination parameters';
  } else if (err instanceof DuplicateItemError) {
    statusCode = StatusCodes.CONFLICT;
    message = err.message;
  }

  return res.status(statusCode);
});

app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});

module.exports = app;
