import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { StudentQuizService } from "../services/quizService";
import toast from "react-hot-toast";

export default function QuizHistory({ onBackToQuizzes }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await StudentQuizService.getQuizHistory();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch quiz history:", error);
        setError("Failed to load quiz history. Please try again.");
        toast.error("Failed to load quiz history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get background color based on score
  const getScoreColor = (score) => {
    if (score >= 80)
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 60)
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <div className="space-y-8">
      {/* Header with navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBackToQuizzes}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500">
          Quiz History
        </h1>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-sky-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-2 border-sky-500/20"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-white transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && history.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4 bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center">
            <DocumentTextIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">No Quiz History</h3>
          <p className="text-slate-400 text-center max-w-md">
            You haven't completed any quizzes yet. Take a quiz to see your
            results here.
          </p>
          <button
            onClick={onBackToQuizzes}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300"
          >
            Take a Quiz
          </button>
        </div>
      )}

      {/* Quiz History List */}
      {!isLoading && !error && history.length > 0 && (
        <div className="space-y-6">
          <p className="text-slate-400">
            You have completed {history.length}{" "}
            {history.length === 1 ? "quiz" : "quizzes"}.
          </p>

          <div className="space-y-4">
            {history.map((attempt, index) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.05 },
                }}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-sky-500/50 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      {attempt.quizTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
                      <div className="flex items-center space-x-2">
                        <AcademicCapIcon className="w-4 h-4" />
                        <span>{attempt.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>{attempt.difficulty}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>
                          {attempt.correctAnswers} / {attempt.totalQuestions}{" "}
                          questions
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(attempt.dateTaken)}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-xl text-center ${getScoreColor(
                      attempt.score
                    )} border`}
                  >
                    <div className="text-sm">Score</div>
                    <div className="text-xl font-bold">
                      {parseFloat(attempt.score).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Back to Quizzes Button (shown only when there's history) */}
      {!isLoading && !error && history.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onBackToQuizzes}
            className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-white transition-all duration-200 group"
          >
            Back to Quizzes
          </button>
        </div>
      )}
    </div>
  );
}
