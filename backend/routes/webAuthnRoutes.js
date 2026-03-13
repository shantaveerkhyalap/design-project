const express = require('express');
const router = express.Router();
const {
    generateRegistrationOptions,
    verifyRegistration,
    generateAuthenticationOptions,
    verifyAuthentication,
} = require('../controllers/webAuthnController');
const { protect } = require('../middleware/authMiddleware');

// Registration requires user to be logged in (usually) to link device
router.get('/register-challenge', protect, generateRegistrationOptions);
router.post('/register-verify', protect, verifyRegistration);

// Login is public
router.post('/login-challenge', generateAuthenticationOptions);
router.post('/login-verify', verifyAuthentication);

module.exports = router;
