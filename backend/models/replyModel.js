const mongoose = require('mongoose');

const replySchema = mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorName: {
            type: String,
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        isExpertAnswer: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;
