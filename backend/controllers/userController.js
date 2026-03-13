const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
// @desc    Update user progress
// @route   POST /api/users/progress
// @access  Private
const updateProgress = async (req, res) => {
    const { moduleId, stage, isCompleted } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (user) {
            const moduleIndex = user.learningProgress.findIndex(p => p.moduleId === moduleId);

            if (moduleIndex > -1) {
                // Update existing module progress
                if (stage && !user.learningProgress[moduleIndex].completedStages.includes(stage)) {
                    user.learningProgress[moduleIndex].completedStages.push(stage);
                }
                if (isCompleted !== undefined) {
                    user.learningProgress[moduleIndex].isCompleted = isCompleted;
                }
                user.learningProgress[moduleIndex].lastUpdated = Date.now();
            } else {
                // Add new module progress
                user.learningProgress.push({
                    moduleId,
                    completedStages: stage ? [stage] : [],
                    isCompleted: isCompleted || false
                });
            }

            const updatedUser = await user.save();
            res.json(updatedUser.learningProgress);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user progress
// @route   GET /api/users/progress
// @access  Private
const getProgress = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (user) {
            res.json(user.learningProgress);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    // We will implement auth middleware later to protect this
    res.status(200).json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProgress,
    getProgress,
};
