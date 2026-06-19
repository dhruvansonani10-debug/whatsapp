const response = (res, statusCode, message, data = {}) => {
    if (!res) {
        console.log(message);
        return;
    }

    return res.status(statusCode).json({
        status: statusCode < 400 ? 'success' : 'error',
        message,
        data,
    });
};

module.exports = response;