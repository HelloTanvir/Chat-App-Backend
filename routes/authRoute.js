const router = require('express').Router();

const { signup, login, logout } = require('../controllers/authController');
const {
    signupValidator,
    authValidationHandler,
    loginValidator,
} = require('../middleware/authValidator');
const checkLogin = require('../middleware/checkLogin');
const profileImageUpload = require('../middleware/profileImageUpload');

router.post('/signup', profileImageUpload, signupValidator, authValidationHandler, signup);

router.post('/login', loginValidator, authValidationHandler, login);

router.get('/logout', checkLogin, logout);

router.get('/checklogin', checkLogin, (req, res) => {
    res.status(200).json({ message: 'You are currently logged in', data: req.user });
});

module.exports = router;
