import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuiz } from "../../contexts/QuizContext";
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClockIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function QuizAnalytics() {
  const { fetchQuizOverview, isLoading } = useQuiz();
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAnalytics = async () => {
      const data = await fetchQuizOverview();
      setAnalytics(data);
    };

    loadAnalytics();
  }, [fetchQuizOverview]);

  const navigateToQuizAnalytics = (quizId) => {
    navigate(`/admin/analytics/${quizId}`);
  };

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-sky-500 border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-2 border-sky-500/20"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-slate-400">No analytics data available</p>
        <button
          onClick={() => navigate("/admin/quizzes")}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-white transition-all duration-200"
        >
          Go to Quizzes
        </button>
      </div>
    );
  }

  // Format data for the charts
  const statusData = [
    { name: "Active", value: analytics.statusCounts.Active || 0 },
    { name: "Draft", value: analytics.statusCounts.Draft || 0 },
    { name: "Archived", value: analytics.statusCounts.Archived || 0 },
  ];

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
              Quiz Analytics
            </h1>
            <p className="text-slate-400 mt-1">
              Insights and performance metrics for your quizzes
            </p>
          </div>
        </motion.div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-sky-500/50 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <DocumentTextIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Quizzes</p>
              <h3 className="text-3xl font-bold text-white">
                {analytics.totalQuizzes}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Total Attempts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-sky-500/50 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <UserGroupIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Attempts</p>
              <h3 className="text-3xl font-bold text-white">
                {analytics.totalAttempts}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Average Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-sky-500/50 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Average Score</p>
              <h3 className="text-3xl font-bold text-white">
                {analytics.averageScore}%
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Active Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-sky-500/50 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <LightBulbIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Quizzes</p>
              <h3 className="text-3xl font-bold text-white">
                {analytics.statusCounts.Active || 0}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Quiz Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Quizzes"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Quiz Categories
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.categoryDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="category" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                  }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value) => [value, "Quizzes"]}
                />
                <Bar dataKey="count" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Attempts Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 lg:col-span-2"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Quiz Attempts (Last 30 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.attemptsOverTime}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                  }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value) => [value, "Attempts"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attempts"
                  stroke="#38bdf8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Popular Quizzes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
      >
        <h3 className="text-xl font-semibold text-white mb-6">
          Most Popular Quizzes
        </h3>
        <div className="space-y-4">
          {analytics.popularQuizzes.length === 0 ? (
            <p className="text-slate-400">No quiz attempts recorded yet</p>
          ) : (
            analytics.popularQuizzes.map((quiz, index) => (
              <div
                key={quiz._id}
                className="bg-slate-700/30 rounded-xl p-4 hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
                onClick={() => navigateToQuizAnalytics(quiz._id)}
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold text-white">
                      {quiz.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <div className="flex items-center space-x-2">
                        <AcademicCapIcon className="w-4 h-4" />
                        <span>{quiz.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{quiz.attemptCount} attempts</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-sky-400">
                    {quiz.averageScore.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
