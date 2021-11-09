function convertErrorToObject (err) {
    return Object.getOwnPropertyNames(err).reduce((acc, curr) => {
        acc[curr] = err[curr];
    }, Object.create(null));
}

module.exports = convertErrorToObject;
