// backend/routes/authRoutes.js
const express = require('express');
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
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send({ error: 'Invalid username or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({ error: 'Invalid username or password' });
    }
    res.send({ 
        message: 'Login successful!',
        username: username,
        loginStatus: true,
        userId: user._id
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
