import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CreateQuiz from "./CreateQuiz";
import { useQuiz } from "../../contexts/QuizContext.jsx";
import toast from "react-hot-toast";

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchQuizById, isLoading: contextIsLoading } = useQuiz();

  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    // Only run this once to prevent infinite loops
    if (fetchAttempted) return;

    const fetchQuiz = async () => {
      console.log(`Fetching quiz with ID: ${id}`);
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchQuizById(id);
        console.log("Fetched quiz data:", data);

        if (!data) {
          throw new Error("Quiz not found");
        }

        setQuiz(data);
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Failed to load quiz. Please try again later.";
        setError(errorMessage);
        toast.error(`Failed to load quiz: ${errorMessage}`);
      } finally {
        setIsLoading(false);
        setFetchAttempted(true);
      }
    };

    fetchQuiz();
  }, [id, fetchQuizById, fetchAttempted]);

  // Add logging to help debug
  useEffect(() => {
    console.log("EditQuiz state:", {
      isLoading,
      contextIsLoading,
      error,
      quiz,
      fetchAttempted,
    });
  }, [isLoading, contextIsLoading, error, quiz, fetchAttempted]);

  const handleRetry = () => {
    setFetchAttempted(false); // Reset to trigger another fetch attempt
  };

  if (isLoading || contextIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-sky-500 border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-2 border-sky-500/20"></div>
          <p className="mt-4 text-sky-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-400">{error}</p>
        <div className="flex space-x-4">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-white transition-all duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/admin/quizzes")}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-xl text-white transition-all duration-200"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-slate-400">Quiz not found</p>
        <button
          onClick={() => navigate("/admin/quizzes")}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-white transition-all duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          <button
            onClick={() => navigate("/admin/quizzes")}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500">
              Edit Quiz
            </h1>
            <p className="text-slate-400 mt-1">
              Update your quiz details and questions
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quiz Form */}
      <CreateQuiz initialData={quiz} mode="edit" />
    </div>
  );
}
