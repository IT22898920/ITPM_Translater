const asyncHandler = require("express-async-handler");
const Quiz = require("../models/quizModel");
const QuizAttempt = require("../models/quizAttemptModel");
const mongoose = require("mongoose");

/**
 * @desc    Get overview dashboard analytics for quizzes
 * @route   GET /api/analytics/quiz-overview
 * @access  Private/Admin
 */
const getQuizOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get total count of quizzes by status
  const quizzesByStatus = await Quiz.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Format the status counts
  const statusCounts = {
    Active: 0,
    Draft: 0,
    Archived: 0,
  };

  quizzesByStatus.forEach((item) => {
    statusCounts[item._id] = item.count;
  });

  // Get total quizzes
  const totalQuizzes = await Quiz.countDocuments({ createdBy: userId });

  // Get total attempts across all quizzes
  const totalAttempts = await QuizAttempt.countDocuments({
    quiz: { $in: await Quiz.find({ createdBy: userId }).distinct("_id") },
  });

  // Get average score
  const avgScoreResult = await QuizAttempt.aggregate([
    {
      $match: {
        quiz: {
          $in: await Quiz.find({ createdBy: userId }).distinct("_id"),
        },
      },
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: "$score" },
      },
    },
  ]);

  const averageScore =
    avgScoreResult.length > 0 ? avgScoreResult[0].averageScore.toFixed(2) : 0;

  // Get most popular quizzes (by attempt count)
  const popularQuizzes = await QuizAttempt.aggregate([
    {
      $match: {
        quiz: {
          $in: await Quiz.find({ createdBy: userId }).distinct("_id"),
        },
      },
    },
    {
      $group: {
        _id: "$quiz",
        attemptCount: { $sum: 1 },
        averageScore: { $avg: "$score" },
      },
    },
    {
      $sort: { attemptCount: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "quizzes",
        localField: "_id",
        foreignField: "_id",
        as: "quizDetails",
      },
    },
    {
      $unwind: "$quizDetails",
    },
    {
      $project: {
        _id: 1,
        title: "$quizDetails.title",
        category: "$quizDetails.category",
        attemptCount: 1,
        averageScore: 1,
      },
    },
  ]);

  // Get attempts over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const attemptsOverTime = await QuizAttempt.aggregate([
    {
      $match: {
        quiz: {
          $in: await Quiz.find({ createdBy: userId }).distinct("_id"),
        },
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Format the attempts over time for the chart
  const formattedAttemptsOverTime = attemptsOverTime.map((item) => ({
    date: item._id,
    attempts: item.count,
  }));

  // Get category distribution
  const categoryDistribution = await Quiz.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Format the response with all analytics
  const analytics = {
    totalQuizzes,
    statusCounts,
    totalAttempts,
    averageScore,
    popularQuizzes,
    attemptsOverTime: formattedAttemptsOverTime,
    categoryDistribution: categoryDistribution.map((item) => ({
      category: item._id,
      count: item.count,
    })),
  };

  res.status(200).json(analytics);
});

/**
 * @desc    Get detailed analytics for a specific quiz
 * @route   GET /api/analytics/quizzes/:id
 * @access  Private/Admin
 */
const getQuizAnalytics = asyncHandler(async (req, res) => {
  const quizId = req.params.id;

  // Verify quiz exists and belongs to user
  const quiz = await Quiz.findOne({
    _id: quizId,
    createdBy: req.user._id,
  });

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // Get total attempts
  const totalAttempts = await QuizAttempt.countDocuments({ quiz: quizId });

  // Get average score
  const avgScoreResult = await QuizAttempt.aggregate([
    { $match: { quiz: mongoose.Types.ObjectId(quizId) } },
    { $group: { _id: null, averageScore: { $avg: "$score" } } },
  ]);

  const averageScore =
    avgScoreResult.length > 0 ? avgScoreResult[0].averageScore.toFixed(2) : 0;

  // Get score distribution
  const scoreDistribution = await QuizAttempt.aggregate([
    { $match: { quiz: mongoose.Types.ObjectId(quizId) } },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ["$score", 20] }, then: "0-19" },
              { case: { $lt: ["$score", 40] }, then: "20-39" },
              { case: { $lt: ["$score", 60] }, then: "40-59" },
              { case: { $lt: ["$score", 80] }, then: "60-79" },
              { case: { $lte: ["$score", 100] }, then: "80-100" },
            ],
            default: "unknown",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Get question difficulty (based on correct answer percentage)
  const questionDifficulty = await QuizAttempt.aggregate([
    { $match: { quiz: mongoose.Types.ObjectId(quizId) } },
    { $unwind: "$answers" },
    {
      $lookup: {
        from: "quizzes",
        localField: "quiz",
        foreignField: "_id",
        as: "quizData",
      },
    },
    { $unwind: "$quizData" },
    { $unwind: "$quizData.questions" },
    {
      $match: {
        $expr: {
          $eq: ["$answers.question", "$quizData.questions._id"],
        },
      },
    },
    {
      $group: {
        _id: "$answers.question",
        questionText: { $first: "$quizData.questions.text" },
        totalAttempts: { $sum: 1 },
        correctAttempts: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$answers.selectedOption",
                  "$quizData.questions.correctOption",
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        questionText: 1,
        totalAttempts: 1,
        correctAttempts: 1,
        correctPercentage: {
          $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100],
        },
      },
    },
    { $sort: { correctPercentage: 1 } },
  ]);

  // Get attempts over time
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const attemptsOverTime = await QuizAttempt.aggregate([
    {
      $match: {
        quiz: mongoose.Types.ObjectId(quizId),
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        averageScore: { $avg: "$score" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Format the response
  const analytics = {
    quizId,
    quizTitle: quiz.title,
    category: quiz.category,
    difficulty: quiz.difficulty,
    totalAttempts,
    averageScore,
    scoreDistribution: scoreDistribution.map((item) => ({
      range: item._id,
      count: item.count,
    })),
    questionDifficulty: questionDifficulty.map((item) => ({
      questionId: item._id,
      text: item.questionText,
      correctPercentage: item.correctPercentage.toFixed(2),
    })),
    attemptsOverTime: attemptsOverTime.map((item) => ({
      date: item._id,
      attempts: item.count,
      averageScore: item.averageScore.toFixed(2),
    })),
  };

  res.status(200).json(analytics);
});

module.exports = {
  getQuizOverview,
  getQuizAnalytics,
};
