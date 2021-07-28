const { check, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const People = require('../models/People');

const signupValidator = [
    check('name')
        .isLength({ min: 1 })
        .withMessage('Name is required')
        .isAlpha('en-US', { ignore: ' -' })
        .withMessage('Name should contain alphabets only')
        .trim(),
    check('email')
        .isEmail()
        .withMessage('Invalid email address')
        .trim()
        .custom(async (value) => {
            try {
                const user = await People.findOne({ email: value });
                if (user) {
                    throw createHttpError(400, 'User has already created by this email');
                }
            } catch (err) {
                throw createHttpError(err.message);
            }
        }),
    check('mobile')
        .isMobilePhone('bn-BD', {
            strictMode: true,
        })
        .withMessage('Mobile number must be a valid Bangladeshi mobile number')
        .trim(),
    check('password')
        .isStrongPassword()
        .withMessage(
            'Password must be at least 8 characters long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 symbol'
        ),
];

const loginValidator = [
    check('email').isEmail().withMessage('Invalid email address').trim(),
    check('password')
        .isStrongPassword()
        .withMessage(
            'Password must be at least 8 characters long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 symbol'
        ),
];

const authValidationHandler = (req, res, next) => {
    const errors = validationResult(req).mapped();

    if (Object.keys(errors).length === 0) return next();

    return res.status(400).json({
        errors,
    });
};

module.exports = {
    signupValidator,
    loginValidator,
    authValidationHandler,
};
