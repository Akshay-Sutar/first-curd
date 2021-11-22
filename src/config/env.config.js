const dotenv = require("dotenv");

// Load env
dotenv.config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoDb: {
    connectionString: process.env.MONGO_CONNECTION_STRING,
    options: {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        poolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    }
  }
};