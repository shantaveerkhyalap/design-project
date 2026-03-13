const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
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
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        views: {
            type: Number,
            default: 0,
        },
        replyCount: {
            type: Number,
            default: 0,
        },
        imageUrl: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Text index for full-text search
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
