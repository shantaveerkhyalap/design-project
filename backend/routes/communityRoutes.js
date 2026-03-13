const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getPosts,
    createPost,
    updatePost,
    likePost,
    viewPost,
    getReplies,
    createReply,
    likeReply,
    deletePost,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

// ─── Multer for plant image uploads ──────────────────────────────────────────

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'community-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
    fileFilter: function (req, file, cb) {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const okExt = allowed.test(path.extname(file.originalname).toLowerCase());
        const okMime = allowed.test(file.mimetype);
        if (okExt && okMime) {
            cb(null, true);
        } else {
            cb(new Error('Images only (jpeg, jpg, png, webp, gif)'));
        }
    },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Posts
router.route('/').get(getPosts).post(protect, upload.single('image'), createPost);
router.route('/:id')
    .put(protect, upload.single('image'), updatePost)
    .delete(protect, deletePost);
router.route('/:id/like').post(protect, likePost);
router.route('/:id/view').post(viewPost);

// Replies
router.route('/:id/replies').get(getReplies).post(protect, createReply);
router.route('/:id/replies/:replyId/like').post(protect, likeReply);

module.exports = router;
