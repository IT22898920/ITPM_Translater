const asyncHandler = require("express-async-handler");
const User = require("../models/newUserModel");
const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Google Login/Register - Simplified with better logging
const googleLogin = asyncHandler(async (req, res) => {
  console.log("Backend: Google login request received");
  console.log("Request body:", req.body);

  const { name, email, firebaseUid, photoURL } = req.body;

  // Validation
  if (!email || !firebaseUid) {
    console.log("Backend: Missing required fields");
    res.status(400);
    throw new Error("Email and Firebase UID are required");
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    console.log("User found by email:", !!user);

    if (user) {
      // Update Firebase UID if it doesn't match
      if (user.firebaseUid !== firebaseUid) {
        console.log("Backend: Updating Firebase UID for existing user");
        user.firebaseUid = firebaseUid;
        user.authProvider = "google";
        if (photoURL) user.photo = photoURL;
        await user.save();
      }
    } else {
      // Create new user
      console.log("Backend: Creating new user");
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        firebaseUid,
        photo: photoURL || "https://i.ibb.co/4pDNDk1/avatar.png",
        authProvider: "google",
        // Generate a secure random password
        password: require("crypto").randomBytes(16).toString("hex"),
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Return user data
    const { _id, role, photo } = user;
    const responseData = {
      _id,
      name: user.name,
      email,
      role,
      photo,
      token,
    };

    console.log("Backend: Login successful, responding with user data");
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Backend Google login error:", error);
    res.status(500);
    throw new Error(error.message || "Server error during Google login");
  }
});

module.exports = { googleLogin };
