// Quiz API service for handling all quiz-related API calls
import axios from "axios";

const API_URL = import.meta.env.VITE_API_NODE_URL || "http://localhost:8070";

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Admin Quiz Management
export const QuizService = {
  // Get all quizzes with optional filters
  getQuizzes: async (filters = {}) => {
    try {
      const {
        search = "",
        category = "All",
        difficulty = "All",
        status = "All",
      } = filters;

      const response = await axiosInstance.get("/api/quizzes", {
        params: { search, category, difficulty, status },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      throw error;
    }
  },

  // Get quiz categories
  getCategories: async () => {
    try {
      const response = await axiosInstance.get("/api/quizzes/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Get quiz by ID
  getQuizById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz ${id}:`, error);
      throw error;
    }
  },

  // Create a new quiz
  createQuiz: async (quizData) => {
    try {
      const response = await axiosInstance.post("/api/quizzes", quizData);
      return response.data;
    } catch (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }
  },

  // Update an existing quiz
  updateQuiz: async (id, quizData) => {
    try {
      const response = await axiosInstance.put(`/api/quizzes/${id}`, quizData);
      return response.data;
    } catch (error) {
      console.error(`Error updating quiz ${id}:`, error);
      throw error;
    }
  },

  // Delete a quiz
  deleteQuiz: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting quiz ${id}:`, error);
      throw error;
    }
  },
};

// Student Quiz Access
export const StudentQuizService = {
  // Get all active quizzes
  getActiveQuizzes: async () => {
    try {
      const response = await axiosInstance.get("/api/student/quizzes");
      return response.data;
    } catch (error) {
      console.error("Error fetching active quizzes:", error);
      throw error;
    }
  },

  // Get quiz for taking
  getQuizForTaking: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/student/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz ${id} for taking:`, error);
      throw error;
    }
  },

  // Submit quiz answers
  submitQuiz: async (id, answers) => {
    try {
      const response = await axiosInstance.post(
        `/api/student/quizzes/${id}/submit`,
        { answers }
      );
      return response.data;
    } catch (error) {
      console.error(`Error submitting quiz ${id}:`, error);
      throw error;
    }
  },

  // Get user's quiz history
  getQuizHistory: async () => {
    try {
      const response = await axiosInstance.get("/api/student/quiz-history");
      return response.data;
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      throw error;
    }
  },
};

// Analytics
export const QuizAnalyticsService = {
  // Get quiz overview dashboard data
  getQuizOverview: async () => {
    try {
      const response = await axiosInstance.get("/api/analytics/quiz-overview");
      return response.data;
    } catch (error) {
      console.error("Error fetching quiz overview:", error);
      throw error;
    }
  },

  // Get detailed analytics for a specific quiz
  getQuizAnalytics: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/analytics/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for quiz ${id}:`, error);
      throw error;
    }
  },
};
