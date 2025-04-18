const express = require("express");
const Posts = require("../models/posts");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

// Save post
router.post("/post/save", protect, (req, res) => {
  const { description, note } = req.body;
  let newPost = new Posts({
    userId: req.user._id,
    description,
    note,
  });

  newPost.save((err) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    return res.status(200).json({ success: "Post saved successfully" });
  });
});

// Get all posts by user
router.get("/posts/:userId", protect, (req, res) => {
  const userId = req.user._id;

  Posts.find({ userId: userId }).exec((err, posts) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    return res.status(200).json({ success: true, postsByUser: posts });
  });
});

// Get all posts - Admin
router.get("/posts", protect, (req, res) => {
  Posts.find().exec((err, posts) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    return res.status(200).json({ success: true, existingPosts: posts });
  });
});

// Update post
router.put("/post/update/:id", protect, (req, res) => {
  Posts.findByIdAndUpdate(req.params.id, { $set: req.body }, (err) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    return res.status(200).json({ success: "Update Successfully" });
  });
});

// Delete post - Admin only
router.delete("/post/delete/:id", protect,  (req, res) => {
  Posts.findByIdAndRemove(req.params.id).exec((err, deletePost) => {
    if (err) return res.status(400).json({ message: "Delete Unsuccessful", err });
    return res.json({ message: "Delete Successful", deletePost });
  });
});

module.exports = router;
