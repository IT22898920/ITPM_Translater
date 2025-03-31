import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export default function QuizTaking({ quiz, onSubmit, onCancel, isSubmitting }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60); // Convert minutes to seconds
  const [isTimeOut, setIsTimeOut] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Initialize timer
  useEffect(() => {
    if (isTimeOut) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimeOut]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Select an answer for the current question
  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [quiz.questions[currentQuestion].id]: optionIndex,
    });
  };

  // Get progress percentage
  const progressPercentage =
    (Object.keys(selectedAnswers).length / quiz.questions.length) * 100;

  // Prepare answers for submission
  const handleSubmitQuiz = () => {
    // Hide confirmation dialog
    setShowConfirmation(false);

    const answers = Object.keys(selectedAnswers).map((questionId) => ({
      questionId,
      selectedOption: selectedAnswers[questionId],
    }));

    onSubmit(quiz.id, answers);
  };

  // Check if all questions have been answered
  const allQuestionsAnswered =
    Object.keys(selectedAnswers).length === quiz.questions.length;

  // Show submission confirmation dialog
  const confirmSubmission = () => {
    if (allQuestionsAnswered || isTimeOut) {
      setShowConfirmation(true);
    }
  };

  // Auto-submit when time runs out
  useEffect(() => {
    if (isTimeOut && !isSubmitting) {
      confirmSubmission();
    }
  }, [isTimeOut, isSubmitting]);

  // Navigate to specific question by index
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
            disabled={isSubmitting}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
            <p className="text-slate-400">
              {quiz.category} • {quiz.difficulty}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
            timeLeft < 60
              ? "bg-red-500/20 text-red-400"
              : timeLeft < 300
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-slate-800/50 text-slate-300"
          }`}
        >
          <ClockIcon className="w-5 h-5" />
          <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800/50 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-sky-500 to-blue-600 h-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Question Navigation Sidebar */}
        <div className="order-2 md:order-1 md:col-span-1">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 sticky top-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Question Navigator
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {quiz.questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    currentQuestion === index
                      ? "bg-sky-500 text-white"
                      : selectedAnswers[question.id] !== undefined
                      ? "bg-slate-700/70 text-white"
                      : "bg-slate-800/70 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Answered</span>
                <span>
                  {Object.keys(selectedAnswers).length} /{" "}
                  {quiz.questions.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Remaining</span>
                <span>
                  {quiz.questions.length - Object.keys(selectedAnswers).length}
                </span>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-700/50">
                <button
                  onClick={confirmSubmission}
                  disabled={
                    (!allQuestionsAnswered && !isTimeOut) || isSubmitting
                  }
                  className={`w-full px-4 py-3 rounded-xl flex items-center justify-center space-x-2 ${
                    (!allQuestionsAnswered && !isTimeOut) || isSubmitting
                      ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-lg hover:shadow-sky-500/25"
                  } transition-all duration-300`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Quiz</span>
                      <CheckIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="order-1 md:order-2 md:col-span-2">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50"
          >
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-300">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0 || isSubmitting}
                    className={`p-2 rounded-lg ${
                      currentQuestion === 0
                        ? "bg-slate-800/30 text-slate-600 cursor-not-allowed"
                        : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white"
                    } transition-all duration-200`}
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={
                      currentQuestion === quiz.questions.length - 1 ||
                      isSubmitting
                    }
                    className={`p-2 rounded-lg ${
                      currentQuestion === quiz.questions.length - 1
                        ? "bg-slate-800/30 text-slate-600 cursor-not-allowed"
                        : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white"
                    } transition-all duration-200`}
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-white">
                {quiz.questions[currentQuestion].text}
              </h2>

              <div className="space-y-4">
                {quiz.questions[currentQuestion].options.map(
                  (option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 rounded-xl flex items-center space-x-4 transition-all duration-200 ${
                        selectedAnswers[quiz.questions[currentQuestion].id] ===
                        index
                          ? "bg-sky-500/20 border border-sky-500/50 text-white"
                          : "bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:border-sky-500/50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedAnswers[
                            quiz.questions[currentQuestion].id
                          ] === index
                            ? "bg-sky-500 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {selectedAnswers[quiz.questions[currentQuestion].id] ===
                        index ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : (
                          <span>{String.fromCharCode(65 + index)}</span>
                        )}
                      </div>
                      <span className="flex-1 text-left">{option}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </motion.div>

          {/* Question Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0 || isSubmitting}
              className={`px-4 py-2 rounded-xl ${
                currentQuestion === 0
                  ? "bg-slate-800/30 text-slate-600 cursor-not-allowed"
                  : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white"
              } transition-all duration-200 flex items-center space-x-2`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Previous</span>
            </button>
            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-slate-300 hover:text-white transition-all duration-200 flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={confirmSubmission}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Finish Quiz</span>
                <CheckIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Time Warning */}
      {timeLeft < 60 && !isTimeOut && (
        <div className="flex items-center justify-center space-x-2 text-red-400 animate-pulse">
          <ExclamationCircleIcon className="w-5 h-5" />
          <span>Less than a minute remaining!</span>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md border border-slate-700/50 w-full">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-sky-500/20 rounded-xl">
                <QuestionMarkCircleIcon className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Submit Quiz?</h3>
            </div>

            <p className="text-slate-300 mb-6">
              {isTimeOut
                ? "Time's up! Your quiz will now be submitted with your current answers."
                : allQuestionsAnswered
                ? "You have answered all questions. Are you sure you want to submit your quiz?"
                : `You have answered ${
                    Object.keys(selectedAnswers).length
                  } out of ${
                    quiz.questions.length
                  } questions. Are you sure you want to submit your quiz?`}
            </p>

            <div className="flex justify-end space-x-4">
              {!isTimeOut && (
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Continue Quiz
                </button>
              )}
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Submit Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
