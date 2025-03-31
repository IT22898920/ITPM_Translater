import { createContext, useContext, useState, useEffect } from "react";
import {
  QuizService,
  StudentQuizService,
  QuizAnalyticsService,
} from "../services/quizService";
import { useAdminStore } from "../stores/adminStore";
import toast from "react-hot-toast";

// Create context
const QuizContext = createContext();

// Quiz provider component
export const QuizProvider = ({ children }) => {
  const { isAuthenticated, admin } = useAdminStore();
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Fetch categories when authenticated as admin
  useEffect(() => {
    if (isAuthenticated && admin?.role === "admin") {
      fetchCategories();
    }
  }, [isAuthenticated, admin]);

  // Fetch quiz categories
  const fetchCategories = async () => {
    try {
      const data = await QuizService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Admin Functions
  const fetchQuizzes = async (filters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await QuizService.getQuizzes(filters);
      setQuizzes(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
      setError("Failed to load quizzes");
      toast.error("Failed to load quizzes");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizById = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await QuizService.getQuizById(id);
      return data;
    } catch (error) {
      console.error(`Failed to fetch quiz ${id}:`, error);
      setError("Failed to load quiz");
      toast.error("Failed to load quiz");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createQuiz = async (quizData) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await QuizService.createQuiz(quizData);
      toast.success("Quiz created successfully");
      return data;
    } catch (error) {
      console.error("Failed to create quiz:", error);
      setError("Failed to create quiz");
      toast.error("Failed to create quiz");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuiz = async (id, quizData) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await QuizService.updateQuiz(id, quizData);
      toast.success("Quiz updated successfully");
      return data;
    } catch (error) {
      console.error(`Failed to update quiz ${id}:`, error);
      setError("Failed to update quiz");
      toast.error("Failed to update quiz");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuiz = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await QuizService.deleteQuiz(id);
      // Update local state after successful deletion
      setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== id));
      toast.success("Quiz deleted successfully");
      return true;
    } catch (error) {
      console.error(`Failed to delete quiz ${id}:`, error);
      setError("Failed to delete quiz");
      toast.error("Failed to delete quiz");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics Functions
  const fetchQuizOverview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await QuizAnalyticsService.getQuizOverview();
      setAnalytics(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch quiz overview:", error);
      setError("Failed to load analytics");
      toast.error("Failed to load analytics");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizAnalytics = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await QuizAnalyticsService.getQuizAnalytics(id);
      return data;
    } catch (error) {
      console.error(`Failed to fetch analytics for quiz ${id}:`, error);
      setError("Failed to load quiz analytics");
      toast.error("Failed to load quiz analytics");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Student Functions
  const fetchActiveQuizzes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await StudentQuizService.getActiveQuizzes();
      return data;
    } catch (error) {
      console.error("Failed to fetch active quizzes:", error);
      setError("Failed to load quizzes");
      toast.error("Failed to load quizzes");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizForTaking = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await StudentQuizService.getQuizForTaking(id);
      return data;
    } catch (error) {
      console.error(`Failed to fetch quiz ${id} for taking:`, error);
      setError("Failed to load quiz");
      toast.error("Failed to load quiz");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const submitQuiz = async (id, answers) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await StudentQuizService.submitQuiz(id, answers);
      return data;
    } catch (error) {
      console.error(`Failed to submit quiz ${id}:`, error);
      setError("Failed to submit quiz");
      toast.error("Failed to submit quiz");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await StudentQuizService.getQuizHistory();
      return data;
    } catch (error) {
      console.error("Failed to fetch quiz history:", error);
      setError("Failed to load quiz history");
      toast.error("Failed to load quiz history");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    // State
    quizzes,
    categories,
    isLoading,
    error,
    analytics,

    // Admin Functions
    fetchQuizzes,
    fetchQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    fetchCategories,

    // Analytics Functions
    fetchQuizOverview,
    fetchQuizAnalytics,

    // Student Functions
    fetchActiveQuizzes,
    fetchQuizForTaking,
    submitQuiz,
    fetchQuizHistory,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

// Custom hook to use the quiz context
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};

export default QuizContext;
