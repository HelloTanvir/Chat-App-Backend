const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');
const People = require('../models/People');

// auth guard to protect routes that need authentication
const checkLogin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // set token from Bearer token in header
        [, token] = req.headers.authorization.split(' ');
    } else if (req.cookies.token) {
        // set token from cookie
        token = req.cookies.token;
    }

    // make sure token exists
    if (!token) return next(createHttpError(401, 'Not authorized to get access to this route'));

    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await People.findById(decoded.id);

        if (!user) return next(createHttpError(401, 'Not authorized to get access to this route'));

        req.user = user;

        return next();
    } catch (err) {
        return next(createHttpError(401, 'Not authorized to get access to this route'));
    }
};

module.exports = checkLogin;
