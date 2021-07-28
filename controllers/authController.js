const People = require('../models/People');
const cloudinary = require('../utils/cloudinary');

// get token from model, create cookie and send response
const sendTokenResponse = (people, statusCode, res) => {
    const token = people.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
        // options.sameSite = 'none';
    }

    res.status(statusCode).cookie('token', token, options).json({
        token,
        data: people,
    });
};

const signup = async (req, res) => {
    const { email } = req.body;
    let uploadedImage = {};

    try {
        if (req.files && req.files.length > 0) {
            uploadedImage = await cloudinary.uploader.upload(req.files[0].path, {
                folder: 'Chat-App/Profile-Images',
            });
        }

        const people = People({
            ...req.body,
            image:
                uploadedImage.secure_url ||
                'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
        });

        await people.save();

        const signedUpUser = await People.findOne({ email });

        sendTokenResponse(signedUpUser, 201, res);
    } catch (err) {
        res.status(err.statusCode || 500).json({
            errors: {
                common: {
                    msg: err.message || 'Server error occured',
                },
            },
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const people = await People.findOne({ email });

        if (!people)
            return res.status(401).json({
                errors: {
                    email: {
                        msg: 'You are not signed up with this email',
                    },
                },
            });

        const isPasswordMatch = await people.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                errors: {
                    password: {
                        msg: 'Incorrect password',
                    },
                },
            });
        }

        return sendTokenResponse(people, 200, res);
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            errors: {
                common: {
                    msg: err.message || 'Server error occured',
                },
            },
        });
    }
};

const logout = (req, res) => {
    res.status(200)
        .cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        })
        .json({
            success: true,
            message: 'You are logged out',
        });
};

module.exports = { signup, login, logout };
