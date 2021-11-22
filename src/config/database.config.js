const mongoose = require("mongoose");
const {
  mongoDb: { options },
} = require("./env.config");

const connect = (connectionString) => mongoose.connect(connectionString, options);

module.exports = connect;
