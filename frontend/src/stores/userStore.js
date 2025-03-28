import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  signInWithCustomToken,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { signInWithGoogleDirectly } from "../firebase/googleAuth";

// API URL for backend authentication
const API_URL = "http://localhost:8070/api/new-user/";

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      resetEmailSent: false,

      // Signup with name, email and password
      signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        console.log("Signup initiated with:", { name, email });

        try {
          // Use the direct-register endpoint
          const response = await axios.post(
            `${API_URL}direct-register`,
            {
              name,
              email: email.trim(),
              password,
            },
            {
              withCredentials: true,
            }
          );

          console.log("Backend registration successful:", response.data);

          // If we received a custom token, use it to sign in to Firebase
          if (response.data.firebaseCustomToken) {
            try {
              await signInWithCustomToken(
                auth,
                response.data.firebaseCustomToken
              );
              console.log("Firebase auth with custom token successful");
            } catch (tokenError) {
              console.warn(
                "Custom token signin failed, trying direct Firebase auth",
                tokenError
              );

              // Fallback: try to authenticate with Firebase directly
              try {
                await createUserWithEmailAndPassword(
                  auth,
                  email.trim(),
                  password
                );
                console.log("Firebase direct auth successful");
              } catch (fbError) {
                console.warn("Firebase direct auth also failed", fbError);
                // Continue anyway since backend registration was successful
              }
            }
          } else {
            // No custom token provided, try to authenticate with Firebase directly
            try {
              await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
              );
              console.log("Firebase direct auth successful");
            } catch (fbError) {
              console.warn("Firebase direct auth failed", fbError);
              // Continue anyway since backend registration was successful
            }
          }

          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          console.error("Signup error:", error);
          let errorMessage = "An error occurred during signup";

          if (error.response?.data?.message) {
            // Backend API error
            errorMessage = error.response.data.message;
          } else if (error.code) {
            // Firebase Auth error codes
            switch (error.code) {
              case "auth/email-already-in-use":
                errorMessage = "This email is already registered";
                break;
              case "auth/invalid-email":
                errorMessage = "Invalid email address";
                break;
              case "auth/weak-password":
                errorMessage = "Password should be at least 6 characters";
                break;
              default:
                errorMessage = error.message;
            }
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      // Send password reset email
      sendPasswordResetEmail: async (email) => {
        set({ isLoading: true, error: null, resetEmailSent: false });
        console.log("Password reset initiated for email:", email);

        try {
          // Check if the email exists in Firebase
          const methods = await fetchSignInMethodsForEmail(auth, email.trim());

          if (methods.length === 0) {
            set({
              isLoading: false,
              error: "No account exists with this email",
              resetEmailSent: false,
            });
            return false;
          }

          // Send password reset email
          await sendPasswordResetEmail(auth, email.trim());
          console.log("Password reset email sent");

          set({
            isLoading: false,
            error: null,
            resetEmailSent: true,
          });
          return true;
        } catch (error) {
          console.error("Password reset error:", error);

          set({
            isLoading: false,
            error: error.message || "Failed to send password reset email",
            resetEmailSent: false,
          });
          return false;
        }
      },

      // Login with email and password
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        console.log("Login initiated with email:", email);

        try {
          // Use the direct-login endpoint
          const response = await axios.post(
            `${API_URL}direct-login`,
            {
              email: email.trim(),
              password,
            },
            {
              withCredentials: true,
            }
          );

          console.log("Backend login successful:", response.data);

          // If we received a custom token, use it to sign in to Firebase
          if (response.data.firebaseCustomToken) {
            try {
              await signInWithCustomToken(
                auth,
                response.data.firebaseCustomToken
              );
              console.log("Firebase auth with custom token successful");
            } catch (tokenError) {
              console.warn(
                "Custom token signin failed, trying direct Firebase auth",
                tokenError
              );

              // Fallback: try to authenticate with Firebase directly
              try {
                await signInWithEmailAndPassword(auth, email.trim(), password);
                console.log("Firebase direct auth successful");
              } catch (fbError) {
                console.warn("Firebase direct auth also failed", fbError);
                // Continue anyway since backend login was successful
              }
            }
          } else {
            // No custom token provided, try to authenticate with Firebase directly
            try {
              await signInWithEmailAndPassword(auth, email.trim(), password);
              console.log("Firebase direct auth successful");
            } catch (fbError) {
              console.warn("Firebase direct auth failed", fbError);
              // Continue anyway since backend login was successful
            }
          }

          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          console.error("Login error:", error);
          let errorMessage = "An error occurred during login";

          if (error.response?.data?.message) {
            // Backend API error
            errorMessage = error.response.data.message;
          } else if (error.code) {
            // Firebase Auth error codes
            switch (error.code) {
              case "auth/user-not-found":
                errorMessage = "No account exists with this email";
                break;
              case "auth/wrong-password":
              case "auth/invalid-credential":
                errorMessage = "Invalid email or password";
                break;
              case "auth/invalid-email":
                errorMessage = "Invalid email address";
                break;
              case "auth/user-disabled":
                errorMessage = "This account has been disabled";
                break;
              case "auth/too-many-requests":
                errorMessage =
                  "Too many failed login attempts. Please try again later or reset your password";
                break;
              default:
                errorMessage = error.message;
            }
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      // Login with Google using direct method
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        console.log("Google login initiated");

        try {
          // Use the direct method that handles everything in one place
          const userData = await signInWithGoogleDirectly();
          console.log("Google login successful:", userData);

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          console.error("Google login error:", error);

          set({
            isLoading: false,
            error: error.message || "Failed to sign in with Google",
          });
          return false;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        console.log("Logout initiated");

        try {
          // Sign out from Firebase
          await signOut(auth);

          // Clear session in backend
          await axios.get(`${API_URL}logout`, { withCredentials: true });
          console.log("Logout successful");

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          console.error("Logout error:", error);
          set({
            isLoading: false,
            error: "Logout failed",
          });
          return false;
        }
      },

      // Reset error state
      resetError: () => set({ error: null, resetEmailSent: false }),

      // Initialize authentication
      initAuth: () => {
        console.log("Initializing auth listener");

        // Listen for Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            console.log("Auth state changed: User logged in", firebaseUser.uid);
            // User is signed in
            if (!get().isAuthenticated) {
              try {
                // Get ID token
                const idToken = await firebaseUser.getIdToken();

                // Get user data from backend
                const response = await axios.get(`${API_URL}getuser`, {
                  headers: { Authorization: `Bearer ${idToken}` },
                  withCredentials: true,
                });

                console.log("User data retrieved from backend:", response.data);

                set({
                  user: response.data,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
              } catch (error) {
                console.error("Error syncing user data:", error);
              }
            }
          } else {
            console.log("Auth state changed: User logged out");
            // User is signed out
            if (get().isAuthenticated) {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          }
        });

        // Return unsubscribe function for cleanup
        return unsubscribe;
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
