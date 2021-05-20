const dotenv = require("dotenv");

// Load env
dotenv.config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoDb: {
    connectionString: process.env.MONGO_CONNECTION_STRING,
    mongooseOptions: {
      useCreateIndex: true,
      useNewUrlParser: true
    }
  }
};
