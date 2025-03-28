// src/firebase/googleAuth.js
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./config";
import axios from "axios";

// API URL for backend
const API_URL = "http://localhost:8070/api/new-user/";

/**
 * Direct Google Sign-in with Popup (avoids redirect issues)
 * This handles the complete flow including backend communication
 */
export const signInWithGoogleDirectly = async () => {
  console.log("Starting direct Google sign-in with popup...");

  try {
    // Create Google provider
    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope("profile");
    googleProvider.addScope("email");

    // Use popup instead of redirect (more reliable)
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful!");

    // Extract user info
    const { displayName, email, photoURL, uid } = result.user;

    // Get ID token
    const idToken = await result.user.getIdToken();
    console.log("ID token acquired");

    // Send to your backend directly
    console.log("Sending data to backend...");
    const response = await axios.post(
      `${API_URL}google-login`,
      {
        name: displayName || email.split("@")[0],
        email,
        photoURL,
        firebaseUid: uid,
        authProvider: "google",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        withCredentials: true,
      }
    );

    console.log("Backend authentication successful!");
    return response.data;
  } catch (error) {
    console.error("Google sign-in error:", error);

    // Handle specific error cases
    if (error.code === "auth/popup-blocked") {
      throw new Error("Popup was blocked. Please enable popups for this site.");
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled.");
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw error;
    }
  }
};
