const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

// Custom module
const { connect, options } = require("./config");
const {
  NotFoundMiddleware,
  UnhandledErrorMiddleware,
} = require("./middlewares");

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception - ", err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection - ", err.stack);
  process.exit(1);
});

const app = express();

// Pipeline
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require("./routes"));
app.use(NotFoundMiddleware);
app.use(UnhandledErrorMiddleware);

if (process.env.NODE_ENV !== 'test') {
  connect(options.mongoDb.connectionString)
    .then((conn) => {
      app.listen(options.port);
    })
    .catch((err) => {
      console.error("Connection failed", err);
      process.exit(1);
    });
}

module.exports = { 
  app 
};
