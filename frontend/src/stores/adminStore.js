import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// API URL for backend authentication
const API_URL = "http://localhost:8070/api/new-user/";

export const useAdminStore = create(
  persist(
    (set, get) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login with username and password
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        console.log("Admin login initiated with username:", username);

        try {
          // For demo/testing purposes, still keep the hardcoded admin check
          // if (username === "admin" && password === "admin") {
          //   // Creating a mock admin user
          //   const adminData = {
          //     _id: "admin-123",
          //     name: "Administrator",
          //     email: "admin@translatorhub.com",
          //     role: "admin",
          //     photo: "https://i.ibb.co/4pDNDk1/avatar.png",
          //   };

          //   console.log("Admin login successful (demo mode):", adminData);

          //   set({
          //     admin: adminData,
          //     isAuthenticated: true,
          //     isLoading: false,
          //     error: null,
          //   });
          //   return true;
          // }

          // Otherwise, try to authenticate against your backend
          // Use the direct-login endpoint
          const response = await axios.post(
            `${API_URL}direct-login`,
            {
              email: username.includes("@")
                ? username
                : `${username}@translatorhub.com`,
              password,
            },
            {
              withCredentials: true,
            }
          );

          const userData = response.data;

          // Check if the user has admin role
          if (userData.role !== "admin") {
            throw new Error("Access denied. Admin privileges required.");
          }

          console.log("Admin login successful:", userData);

          set({
            admin: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          console.error("Admin login error:", error);

          let errorMessage = "Invalid username or password";

          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      // Logout
      logout: () => {
        console.log("Admin logout initiated");

        try {
          // Clear HTTP-only cookies by calling logout endpoint
          axios
            .get(`${API_URL}logout`, { withCredentials: true })
            .catch((err) => console.warn("Logout API call failed:", err));

          set({
            admin: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          console.log("Admin logout successful");
          return true;
        } catch (error) {
          console.error("Admin logout error:", error);
          return false;
        }
      },

      // Reset error state
      resetError: () => set({ error: null }),
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
