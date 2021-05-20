const mongoose = require('mongoose');

function isValidObjectId(id) {
    if (!id) {
        return false;
    }

    return mongoose.Types.ObjectId.isValid(id);
}

function mapResponse(message, data) {
    const response = Object.create(null);

    if (message) {
        response.message = message;
    }

    if (data && Object.keys(data).length) {
        response.data = data;
    }

    return response;
}

module.exports = {
    isValidObjectId,
    mapResponse
};
