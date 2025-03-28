const express = require('express');
const Posts = require('../models/posts');

const router = express.Router();

// Save post
router.post('/post/save', (req, res) => {
    let newPost = new Posts(req.body);
    newPost.save((err) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        return res.status(200).json({
            success: "Post saved successfully"
        });
    });
});

// Get all posts by user ID
router.get('/posts/:userId', (req, res) => {
    const userId = req.params.userId;

    // Find posts by user ID
    Posts.find({ userId: userId }).exec((err, posts) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        return res.status(200).json({
            success: true,
            postsByUser: posts
        });
    });
});

// Get all posts
router.get('/posts', (req, res) => {
    Posts.find().exec((err, posts) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        return res.status(200).json({
            success: true,
            existingPosts: posts
        });
    });
});

// Get specific post
router.get("/post/:id", (req, res) => {
    let postId = req.params.id;
    Posts.findById(postId, (err, post) => {
        if (err) {
            return res.status(400).json({
                success: false,
                err
            });
        }
        return res.status(200).json({
            success: true,
            post
        });
    });
});

// Update post
router.put('/post/update/:id', (req, res) => {
    Posts.findByIdAndUpdate(
        req.params.id, {
            $set: req.body
        }, (err, post) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            return res.status(200).json({
                success: "Update Successfully"
            });
        }
    );
});

// Delete post
router.delete('/post/delete/:id', (req, res) => {
    Posts.findByIdAndRemove(req.params.id).exec((err, deletePost) => {
        if (err) return res.status(400).json({
            message: "Delete Unsuccessful",
            err
        });
        return res.json({
            message: "Delete Successful",
            deletePost
        });
    });
});

module.exports = router;
