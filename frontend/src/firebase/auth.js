// src/firebase/auth.js
import {
  getAuth,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./config";

// Create a Google auth provider instance
const googleProvider = new GoogleAuthProvider();
// Add scopes for profile and email
googleProvider.addScope("profile");
googleProvider.addScope("email");
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Sign in with Google using redirect
 */
export const signInWithGoogle = async () => {
  console.log("Starting Google sign-in redirect...");
  try {
    await signInWithRedirect(auth, googleProvider);
    console.log("Redirect initiated successfully");
    return null; // Will redirect
  } catch (error) {
    console.error("Google sign-in redirect error:", error);
    throw error;
  }
};

/**
 * Check for redirect result when the page loads
 * This is critical for completing the Google auth flow
 */
export const checkRedirectResult = async () => {
  console.log("Checking for redirect result...");
  try {
    const result = await getRedirectResult(auth);
    console.log("Redirect result received:", result ? "Success" : "No result");
    if (result) {
      console.log("User info:", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      });
    }
    return result;
  } catch (error) {
    console.error("Redirect result error:", error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const emailSignIn = async (email, password) => {
  console.log("Starting email sign-in...");
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Email sign-in successful");
    return result;
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
};

/**
 * Create a new user with email and password
 */
export const emailSignUp = async (email, password) => {
  console.log("Starting email sign-up...");
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Email sign-up successful");
    return result;
  } catch (error) {
    console.error("Email sign-up error:", error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const logOut = async () => {
  console.log("Starting sign-out...");
  try {
    await signOut(auth);
    console.log("Sign-out successful");
  } catch (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
};
