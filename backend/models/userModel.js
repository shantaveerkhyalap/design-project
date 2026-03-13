const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'user', // Can be 'admin' later
        },
        currentChallenge: { type: String },
        authenticators: [
            {
                credentialID: { type: String, required: true },
                credentialPublicKey: { type: Buffer, required: true },
                counter: { type: Number, required: true },
                transports: [{ type: String }],
            },
        ],
        learningProgress: [
            {
                moduleId: { type: String, required: true },
                completedStages: [{ type: Number }], // Array of completed stage numbers
                isCompleted: { type: Boolean, default: false },
                lastUpdated: { type: Date, default: Date.now }
            }
        ],
    },
    {
        timestamps: true,
    }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
