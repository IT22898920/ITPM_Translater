// backend/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user.js')

// Register route
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    const user = new User({ firstName, lastName, username, password });
    await user.save();
    res.status(201).send({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the stored password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id }, // Payload (user ID)
      process.env.JWT_SECRET, // Secret key from .env
      { expiresIn: "1h" } // Token expiry (optional)
    );

    // Send the response with token
    res.send({
      message: "Login successful!",
      username: user.username,
      loginStatus: true,
      userId: user._id,
      token: token, // Send the token in the response
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
