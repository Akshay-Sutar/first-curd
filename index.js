// System module

// NPM/yarn module
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { StatusCodes } = require('http-status-codes');

// Custom module
const config = require('./config');
const convertErrorToObject = require('./lib/error');

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception - ', err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection - ', err.stack);
    process.exit(1);
});


const app = express();
require('./config/database');

// Pipeline
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    return res.json({ message: "Hello world!" });
});

app.use(require('./routes'));

app.use((err, req, res, next) => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(convertErrorToObject(err));
});

app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
});
