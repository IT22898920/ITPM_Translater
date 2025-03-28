const asyncHandler = require("express-async-handler");
const admin = require("firebase-admin");
const User = require("../models/newUserModel");

// Initialize Firebase Admin SDK (should be called only once in server.js)
const initFirebaseAdmin = () => {
  const serviceAccount = require("../firebase-service-account.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

// Verify Firebase token middleware
const verifyFirebaseToken = asyncHandler(async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    const idToken = authHeader.split(" ")[1];

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Add Firebase UID to request
    req.firebaseUid = decodedToken.uid;
    req.firebaseEmail = decodedToken.email;
    req.firebaseName = decodedToken.name || "";

    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    res.status(401);
    throw new Error("Not authorized, invalid token");
  }
});

// Protect routes (verify token and get user from DB)
const protectWithFirebase = asyncHandler(async (req, res, next) => {
  await verifyFirebaseToken(req, res, async () => {
    try {
      // Get user from database based on Firebase UID
      const user = await User.findOne({ firebaseUid: req.firebaseUid }).select(
        "-password"
      );

      if (!user) {
        res.status(401);
        throw new Error("User not found");
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error(error.message || "Not authorized, please login");
    }
  });
});

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized, admin only");
  }
};

module.exports = {
  initFirebaseAdmin,
  verifyFirebaseToken,
  protectWithFirebase,
  adminOnly,
};
