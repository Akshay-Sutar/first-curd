// System module

// NPM module
const mongoose = require('mongoose');

// Custom module
const config = require('./index');

(async () => {
    try {
        const { connectionString, options } = config.mongoDb;
        await mongoose.connect(connectionString, {});
        console.log('MongoDb connected!');
    } catch (err) {
        console.error(err.stack);
        process.exit(1);
    }
})();
