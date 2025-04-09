const express = require("express");
const Posts = require("../models/posts"); // Import the Posts model
const { protect, adminOnly } = require("../middlewares/authMiddleware"); // Import protect and adminOnly

const router = express.Router();

// Save post - Protected route
router.post("/post/save", protect, (req, res) => {
  const { description, note } = req.body;
  let newPost = new Posts({
    userId: req.user._id, // Use the authenticated user's ID
    description,
    note
  });

  newPost.save((err) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    return res.status(200).json({ success: "Post saved successfully" });
  });
});

// Get all posts by user ID - Protected route
router.get("/posts/:userId", protect, (req, res) => {
  const userId = req.user._id; // Get the user ID from the authenticated user

  Posts.find({ userId: userId }).exec((err, posts) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    return res.status(200).json({ success: true, postsByUser: posts });
  });
});

// Get all posts - Admin Only route
router.get("/posts", protect, adminOnly, (req, res) => {
  Posts.find().exec((err, posts) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    return res.status(200).json({ success: true, existingPosts: posts });
  });
});

// Update post - Protected route
router.put("/post/update/:id", protect, (req, res) => {
  Posts.findByIdAndUpdate(req.params.id, { $set: req.body }, (err, post) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    return res.status(200).json({ success: "Update Successfully" });
  });
});

// Delete post - Admin Only route
router.delete("/post/delete/:id", protect, adminOnly, (req, res) => {
  Posts.findByIdAndRemove(req.params.id).exec((err, deletePost) => {
    if (err) return res.status(400).json({ message: "Delete Unsuccessful", err });
    return res.json({ message: "Delete Successful", deletePost });
  });
});

module.exports = router;
