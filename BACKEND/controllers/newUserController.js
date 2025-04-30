const asyncHandler = require("express-async-handler");
const User = require("../models/newUserModel");
const jwt = require("jsonwebtoken");

// Generate JWT Token (for compatibility with existing systems) j
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, firebaseUid } = req.body;

  // Validation
  if (!name || !email || !firebaseUid) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Verify email from Firebase token matches request (only if we have firebaseEmail)j
  if (req.firebaseEmail && email !== req.firebaseEmail) {
    res.status(400);
    throw new Error("Email mismatch with authenticated user");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    firebaseUid,
    authProvider: req.body.authProvider || "email",
    photo: req.body.photoURL || "https://i.ibb.co/4pDNDk1/avatar.png",
  });

  // Generate JWT Token for backward compatibility j
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, email, role, photo } = user;
    res.status(201).json({
      _id,
      name,
      email,
      role,
      photo,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { firebaseUid } = req.body;

  // Find user in our database
  const user = await User.findOne({ firebaseUid });

  if (!user) {
    // User not found, must register first
    res.status(404);
    throw new Error("User not found. Please register.");
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  // Return user data
  const { _id, name, email, role, photo } = user;
  res.status(200).json({
    _id,
    name,
    email,
    role,
    photo,
    token,
  });
});

// Logout User
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Successfully Logged Out" });
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
  // User is already available from the protectWithFirebase middleware
  const user = req.user;

  const { _id, name, email, role, photo } = user;
  res.status(200).json({
    _id,
    name,
    email,
    role,
    photo,
  });
});

// Update user profile
const updateUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user) {
    const { name } = user;
    user.name = req.body.name || name;

    // Email updates should be handled through Firebase Auth, not here

    // Photo update
    if (req.body.photo) {
      user.photo = req.body.photo;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      photo: updatedUser.photo,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  updateUser,
};
