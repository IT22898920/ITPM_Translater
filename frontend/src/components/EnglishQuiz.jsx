import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AcademicCapIcon,
  ClockIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { StudentQuizService } from "../services/quizService";
import QuizTaking from "./QuizTaking";
import QuizResults from "./QuizResults";
import QuizHistory from "./QuizHistory";
import toast from "react-hot-toast";

export default function EnglishQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState("list"); // list, taking, results, history
  const [quizResult, setQuizResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Fetch quizzes on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await StudentQuizService.getActiveQuizzes();
        setQuizzes(data);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
        setError("Failed to load quizzes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Filter quizzes based on search term and difficulty
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  // Handle starting a quiz
  const handleStartQuiz = async (quiz) => {
    setIsLoading(true);

    try {
      const quizData = await StudentQuizService.getQuizForTaking(quiz.id);
      setSelectedQuiz(quizData);
      setQuizMode("taking");
    } catch (error) {
      console.error("Failed to load quiz:", error);
      toast.error("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quiz submission
  const handleQuizSubmit = async (quizId, answers) => {
    setIsLoading(true);

    try {
      const result = await StudentQuizService.submitQuiz(quizId, answers);
      setQuizResult(result);
      setQuizMode("results");
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle going back to quiz list
  const handleBackToList = () => {
    setSelectedQuiz(null);
    setQuizResult(null);
    setQuizMode("list");
  };

  // Handle viewing quiz history
  const handleViewHistory = () => {
    setQuizMode("history");
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <AnimatePresence mode="wait">
        {quizMode === "list" && (
          <motion.div
            key="quiz-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500">
                English Quizzes
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Test your English language skills with our interactive quizzes.
                Each quiz is designed to help you improve specific areas of
                English proficiency.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="relative w-full md:w-auto flex-1">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                  >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
                <button
                  onClick={handleViewHistory}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:border-sky-500/50 transition-all duration-200 whitespace-nowrap"
                >
                  View History
                </button>
              </div>
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
            {!isLoading && !error && filteredQuizzes.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4 bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50">
                <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center">
                  <QuestionMarkCircleIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  No Quizzes Found
                </h3>
                <p className="text-slate-400 text-center max-w-md">
                  {searchTerm || selectedDifficulty !== "All"
                    ? "No quizzes match your current filters. Try adjusting your search criteria."
                    : "There are no quizzes available at the moment. Please check back later."}
                </p>
                {(searchTerm || selectedDifficulty !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedDifficulty("All");
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Quiz Cards */}
            {!isLoading && !error && filteredQuizzes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.1 },
                    }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-sky-500/50 transition-all duration-300 flex flex-col"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-white">
                            {quiz.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              quiz.difficulty === "Beginner"
                                ? "bg-green-500/20 text-green-400"
                                : quiz.difficulty === "Intermediate"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {quiz.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <AcademicCapIcon className="w-4 h-4" />
                            <span>{quiz.category}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{quiz.duration}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="mt-6 w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300 flex items-center justify-center space-x-2 group"
                      >
                        <span>Start Quiz</span>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {quizMode === "taking" && selectedQuiz && (
          <motion.div
            key="quiz-taking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <QuizTaking
              quiz={selectedQuiz}
              onSubmit={handleQuizSubmit}
              onCancel={handleBackToList}
              isSubmitting={isLoading}
            />
          </motion.div>
        )}

        {quizMode === "results" && quizResult && (
          <motion.div
            key="quiz-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <QuizResults
              result={quizResult}
              onReturnToList={handleBackToList}
            />
          </motion.div>
        )}

        {quizMode === "history" && (
          <motion.div
            key="quiz-history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <QuizHistory onBackToQuizzes={handleBackToList} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
