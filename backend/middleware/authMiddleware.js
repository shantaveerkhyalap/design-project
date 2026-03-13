const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            // User not found in DB (deleted account or wrong DB)
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized: user not found' });
            }

            return next();
        } catch (error) {
            console.error('Auth error:', error.message);
            return res.status(401).json({ message: 'Not authorized: invalid token' });
        }
    }

    return res.status(401).json({ message: 'Not authorized: no token' });
};

module.exports = { protect };
