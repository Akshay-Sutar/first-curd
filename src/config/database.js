// System module

// NPM module
const mongoose = require('mongoose');

// Custom module
const config = require('./index');

const connect = async () => {
    try {
        const { connectionString, options } = config.mongoDb;
        await mongoose.connect(connectionString, options);
        console.log('MongoDb connected!');
    } catch (err) {
        console.error(err.stack);
        process.exit(1);
    }
};

switch (process.env.NODE_ENV){
    case 'test':
        // Connect to test DB
        break;
    default:
        connect();
}
