const Post = require('../models/postModel');
const Reply = require('../models/replyModel');

// @desc    Get all posts (with search, tag filter, sort)
// @route   GET /api/community
// @access  Public
const getPosts = async (req, res) => {
    try {
        const { search, tag, sort } = req.query;

        let query = {};

        // Tag filter
        if (tag && tag !== 'all') {
            query.tags = tag.toLowerCase();
        }

        // Full-text search
        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        // Sort options
        let sortOption = { createdAt: -1 }; // default: newest
        if (sort === 'likes') {
            sortOption = { likesCount: -1 };
        } else if (sort === 'replies') {
            sortOption = { replyCount: -1 };
        } else if (sort === 'views') {
            sortOption = { views: -1 };
        }

        const posts = await Post.find(query)
            .sort(sortOption)
            .lean();

        // Add likes count virtual
        const postsWithMeta = posts.map(post => ({
            ...post,
            likeCount: post.likes ? post.likes.length : 0,
        }));

        res.json(postsWithMeta);
    } catch (error) {
        console.error('getPosts error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new post
// @route   POST /api/community
// @access  Private
const createPost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const post = await Post.create({
            title,
            content,
            author: req.user._id,
            authorName: req.user.name,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        });

        res.status(201).json({
            ...post.toObject(),
            likeCount: 0,
        });
    } catch (error) {
        console.error('createPost error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle like on a post
// @route   POST /api/community/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user._id.toString();
        const likeIndex = post.likes.findIndex(id => id.toString() === userId);

        if (likeIndex === -1) {
            // Like
            post.likes.push(req.user._id);
        } else {
            // Unlike
            post.likes.splice(likeIndex, 1);
        }

        await post.save();

        res.json({
            liked: likeIndex === -1,
            likeCount: post.likes.length,
        });
    } catch (error) {
        console.error('likePost error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment view count on a post
// @route   POST /api/community/:id/view
// @access  Public
const viewPost = async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get replies for a post
// @route   GET /api/community/:id/replies
// @access  Public
const getReplies = async (req, res) => {
    try {
        const replies = await Reply.find({ postId: req.params.id })
            .sort({ createdAt: 1 })
            .lean();

        const repliesWithMeta = replies.map(r => ({
            ...r,
            likeCount: r.likes ? r.likes.length : 0,
        }));

        res.json(repliesWithMeta);
    } catch (error) {
        console.error('getReplies error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a reply on a post
// @route   POST /api/community/:id/replies
// @access  Private
const createReply = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Reply content is required' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const reply = await Reply.create({
            postId: req.params.id,
            content,
            author: req.user._id,
            authorName: req.user.name,
        });

        // Increment reply count
        post.replyCount = (post.replyCount || 0) + 1;
        await post.save();

        res.status(201).json({
            ...reply.toObject(),
            likeCount: 0,
        });
    } catch (error) {
        console.error('createReply error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle like on a reply
// @route   POST /api/community/:id/replies/:replyId/like
// @access  Private
const likeReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.replyId);

        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        const userId = req.user._id.toString();
        const likeIndex = reply.likes.findIndex(id => id.toString() === userId);

        if (likeIndex === -1) {
            reply.likes.push(req.user._id);
        } else {
            reply.likes.splice(likeIndex, 1);
        }

        await reply.save();

        res.json({
            liked: likeIndex === -1,
            likeCount: reply.likes.length,
        });
    } catch (error) {
        console.error('likeReply error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a post (author only)
// @route   DELETE /api/community/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Post.findByIdAndDelete(req.params.id);
        await Reply.deleteMany({ postId: req.params.id });

        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a post (author only)
// @route   PUT /api/community/:id
// @access  Private
const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, content, tags } = req.body;

        if (title) post.title = title.trim();
        if (content) post.content = content.trim();
        if (tags !== undefined) {
            post.tags = Array.isArray(tags)
                ? tags
                : tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        // Allow updating image if a new one uploaded
        if (req.file) post.imageUrl = `/uploads/${req.file.filename}`;

        const updated = await post.save();

        res.json({
            ...updated.toObject(),
            likeCount: updated.likes.length,
        });
    } catch (error) {
        console.error('updatePost error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPosts,
    createPost,
    updatePost,
    likePost,
    viewPost,
    getReplies,
    createReply,
    likeReply,
    deletePost,
};
