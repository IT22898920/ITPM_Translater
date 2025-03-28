const asyncHandler = require("express-async-handler");
const User = require("../models/newUserModel");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Direct Register User (without Firebase token)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("Email has already been registered");
    }

    // Create a user in Firebase
    let firebaseUid;
    try {
      const firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      firebaseUid = firebaseUser.uid;
      console.log("Created Firebase user:", firebaseUid);
    } catch (firebaseError) {
      console.error("Firebase user creation error:", firebaseError);

      // If email already exists in Firebase but not in our DB
      if (firebaseError.code === "auth/email-already-exists") {
        try {
          // Try to get the existing Firebase user
          const existingFirebaseUser = await admin.auth().getUserByEmail(email);
          firebaseUid = existingFirebaseUser.uid;
          console.log("Found existing Firebase user:", firebaseUid);
        } catch (error) {
          res.status(400);
          throw new Error("Email already exists in authentication system");
        }
      } else {
        res.status(400);
        throw new Error(
          firebaseError.message || "Failed to create authentication"
        );
      }
    }

    // Create user in our database
    const user = await User.create({
      name,
      email,
      firebaseUid,
      authProvider: "email",
      photo: "https://i.ibb.co/4pDNDk1/avatar.png",
    });

    // Generate JWT Token
    const token = generateToken(user._id);

    // Create a custom token for Firebase auth on the client
    const customToken = await admin.auth().createCustomToken(firebaseUid);

    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    // Return user data
    const { _id, role, photo } = user;
    res.status(201).json({
      _id,
      name,
      email,
      role,
      photo,
      token,
      firebaseCustomToken: customToken,
    });
  } catch (error) {
    console.error("Direct registration error:", error);
    res.status(500);
    throw new Error(error.message || "Registration failed");
  }
});

// Direct Login User (without Firebase token)
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  try {
    console.log(`Attempting login for email: ${email}`);

    // Find user in our database
    const user = await User.findOne({ email });
    console.log(`User found in database: ${!!user}`);

    if (!user) {
      res.status(404);
      throw new Error("User not found. Please register first.");
    }

    if (!user.firebaseUid) {
      res.status(400);
      throw new Error("Authentication error. Please register again.");
    }

    // Try to authenticate with Firebase
    try {
      // Attempt to get the user from Firebase to verify they exist
      const firebaseUser = await admin.auth().getUser(user.firebaseUid);
      console.log(`Firebase user verified: ${firebaseUser.uid}`);

      // Create a custom token for client-side Firebase auth
      const customToken = await admin
        .auth()
        .createCustomToken(firebaseUser.uid);

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

      // Return user data with Firebase custom token
      const { _id, name, role, photo } = user;
      console.log(`Login successful for user: ${name}`);
      return res.status(200).json({
        _id,
        name,
        email,
        role,
        photo,
        token,
        firebaseCustomToken: customToken, // Frontend will use this to authenticate with Firebase client
      });
    } catch (firebaseError) {
      console.error("Firebase authentication failed:", firebaseError);

      // If Firebase user not found, try to recreate it
      if (firebaseError.code === "auth/user-not-found") {
        try {
          // Create the user in Firebase
          const newFirebaseUser = await admin.auth().createUser({
            uid: user.firebaseUid, // Use the existing UID from our database
            email,
            password,
            displayName: user.name,
          });

          // Create a custom token
          const customToken = await admin
            .auth()
            .createCustomToken(newFirebaseUser.uid);

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
          const { _id, name, role, photo } = user;
          console.log(`Login successful with recreated Firebase user: ${name}`);
          return res.status(200).json({
            _id,
            name,
            email,
            role,
            photo,
            token,
            firebaseCustomToken: customToken,
          });
        } catch (createError) {
          console.error("Failed to recreate Firebase user:", createError);

          // If we can't recreate with the same UID, create a new user
          if (createError.code === "auth/uid-already-exists") {
            try {
              // Create a new Firebase user without specifying the UID
              const brandNewUser = await admin.auth().createUser({
                email,
                password,
                displayName: user.name,
              });

              // Update our database with the new UID
              user.firebaseUid = brandNewUser.uid;
              await user.save();

              // Create a custom token
              const customToken = await admin
                .auth()
                .createCustomToken(brandNewUser.uid);

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
              const { _id, name, role, photo } = user;
              console.log(
                `Login successful with brand new Firebase user: ${name}`
              );
              return res.status(200).json({
                _id,
                name,
                email,
                role,
                photo,
                token,
                firebaseCustomToken: customToken,
              });
            } catch (finalError) {
              console.error(
                "All Firebase user creation attempts failed:",
                finalError
              );
              res.status(500);
              throw new Error(
                "Authentication service error. Please try again later."
              );
            }
          } else {
            res.status(500);
            throw new Error("Authentication error. Please try again.");
          }
        }
      } else {
        // Other Firebase errors
        res.status(401);
        throw new Error("Invalid email or password");
      }
    }
  } catch (error) {
    console.error("Direct login error:", error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || "Login failed");
  }
});

module.exports = {
  registerUser,
  loginUser,
};
