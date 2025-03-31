import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  TrophyIcon,
  FireIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export default function QuizResults({ result, onReturnToList }) {
  const totalQuestions = result.totalQuestions;
  const correctAnswers = result.correctAnswers;
  const score = parseFloat(result.score);

  const getScoreMessage = () => {
    if (score >= 80) return "🎉 Excellent!";
    if (score >= 60) return "👍 Good Job!";
    return "💪 Keep Practicing!";
  };

  return (
    <div className="space-y-8">
      {/* Header with navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onReturnToList}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500">
          Quiz Results
        </h1>
      </div>

      {/* Results Summary */}
      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <TrophyIcon className="w-16 h-16 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {getScoreMessage()}
                </h2>
                <p className="text-slate-300">You scored {score.toFixed(1)}%</p>
              </div>
            </div>

            <div className="text-5xl font-bold">
              <span className="text-blue-400">{correctAnswers}</span>
              <span className="text-slate-400">/{totalQuestions}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 flex items-center space-x-4">
              <FireIcon className="w-10 h-10 text-orange-400" />
              <div>
                <div className="text-lg text-slate-300">Questions</div>
                <div className="text-2xl font-bold text-white">
                  {totalQuestions}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 flex items-center space-x-4">
              <AcademicCapIcon className="w-10 h-10 text-blue-400" />
              <div>
                <div className="text-lg text-slate-300">Correct</div>
                <div className="text-2xl font-bold text-blue-400">
                  {correctAnswers}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 flex items-center space-x-4">
              <XCircleIcon className="w-10 h-10 text-red-400" />
              <div>
                <div className="text-lg text-slate-300">Incorrect</div>
                <div className="text-2xl font-bold text-red-400">
                  {totalQuestions - correctAnswers}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Review Questions</h2>

        {result.questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
          >
            <div className="mb-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium text-white">
                  {index + 1}. {question.text}
                </h3>
                {question.correctOption === question.userSelection ? (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Correct</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-400">
                    <XCircleIcon className="w-5 h-5" />
                    <span>Incorrect</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`p-4 rounded-xl ${
                    optIndex === question.correctOption
                      ? "bg-green-500/20 border border-green-500/50"
                      : optIndex === question.userSelection &&
                        optIndex !== question.correctOption
                      ? "bg-red-500/20 border border-red-500/50"
                      : "bg-slate-700/50 border border-slate-600/50"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-7 h-7 rounded-full mr-3 flex items-center justify-center ${
                        optIndex === question.correctOption
                          ? "bg-green-500 text-white"
                          : optIndex === question.userSelection &&
                            optIndex !== question.correctOption
                          ? "bg-red-500 text-white"
                          : "bg-slate-600 text-slate-300"
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}
                    </div>
                    <span
                      className={`${
                        optIndex === question.correctOption
                          ? "text-green-400"
                          : optIndex === question.userSelection &&
                            optIndex !== question.correctOption
                          ? "text-red-400"
                          : "text-slate-300"
                      }`}
                    >
                      {option}
                    </span>

                    {optIndex === question.correctOption && (
                      <CheckCircleIcon className="ml-auto w-5 h-5 text-green-500" />
                    )}
                    {optIndex === question.userSelection &&
                      optIndex !== question.correctOption && (
                        <XCircleIcon className="ml-auto w-5 h-5 text-red-500" />
                      )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onReturnToList}
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center space-x-2 text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300 group"
        >
          <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span>Try Another Quiz</span>
        </button>
      </div>
    </div>
  );
}
