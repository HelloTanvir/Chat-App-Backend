const createHttpError = require('http-errors');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.statusCode = err.statusCode;
    error.message = err.message;
    console.log(err);

    // bad object id
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = createHttpError(404, message);
    }

    // mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = createHttpError(400, message);
    }

    // mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = createHttpError(400, message);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server error',
    });
};

module.exports = errorHandler;
