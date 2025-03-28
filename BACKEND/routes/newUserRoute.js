const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logout,
  getUser,
  updateUser,
} = require("../controllers/newUserController");
const { googleLogin } = require("../controllers/googleAuthController");
const { protect } = require("../middlewares/authMiddleware");
const {
  verifyFirebaseToken,
} = require("../middlewares/firebaseAuthMiddleware");

// Debugging middleware
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(
    "Headers:",
    req.headers["authorization"]
      ? "Authorization: [PRESENT]"
      : "Authorization: [MISSING]"
  );
  next();
});

// Direct auth routes (without Firebase token verification)
router.post(
  "/direct-register",
  require("../controllers/directAuthController").registerUser
);
router.post(
  "/direct-login",
  require("../controllers/directAuthController").loginUser
);

// Firebase auth routes (with token verification)
router.post("/register", verifyFirebaseToken, registerUser);
router.post("/login", verifyFirebaseToken, loginUser);
router.post("/google-login", googleLogin);

// Logout endpoint
router.get("/logout", logout);

// Protected routes
router.get("/getuser", protect, getUser);
router.patch("/updateuser", protect, updateUser);

module.exports = router;
