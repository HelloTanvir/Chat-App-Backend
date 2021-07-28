/* eslint-disable func-names */
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const peopleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'Please input your name'],
        },

        email: {
            type: String,
            trim: true,
            required: [true, 'Please input your email'],
            lowercase: true,
        },

        mobile: {
            type: String,
            trim: true,
            required: [true, 'Please input your mobile'],
        },

        password: {
            type: String,
            required: [true, 'Please input your password'],
        },

        image: {
            type: String,
        },
    },
    { timestamps: true }
);

// hash password before save
peopleSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// match password for login
peopleSchema.methods.matchPassword = async function (enteredPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    return isMatch;
};

// save token on cookie when admin is logged in
peopleSchema.methods.getSignedJwtToken = function () {
    // eslint-disable-next-line no-underscore-dangle
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

const People = mongoose.model('People', peopleSchema);
module.exports = People;
