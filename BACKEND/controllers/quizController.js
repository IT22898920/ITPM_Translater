const asyncHandler = require("express-async-handler");
const Quiz = require("../models/quizModel");

/**
 * @desc    Get all quizzes with optional filtering
 * @route   GET /api/quizzes
 * @access  Private/Admin
 */
const getQuizzes = asyncHandler(async (req, res) => {
  const {
    search = "",
    category = "All",
    difficulty = "All",
    status = "All",
  } = req.query;

  // Build filter object based on query parameters
  const filter = { createdBy: req.user._id };

  if (search) {
    filter.title = { $regex: search, $options: "i" }; // Case-insensitive search
  }

  if (category !== "All") {
    filter.category = category;
  }

  if (difficulty !== "All") {
    filter.difficulty = difficulty;
  }

  if (status !== "All") {
    filter.status = status;
  }

  // Execute query, only return necessary fields for the list view
  const quizzes = await Quiz.find(filter)
    .select(
      "title category difficulty duration status createdAt updatedAt questions"
    )
    .sort({ updatedAt: -1 }) // Most recently updated first
    .lean();

  // Format the response to match frontend expectations
  const formattedQuizzes = quizzes.map((quiz) => ({
    id: quiz._id,
    title: quiz.title,
    category: quiz.category,
    questions: quiz.questions.length, // Count of questions
    duration: `${quiz.duration} mins`,
    difficulty: quiz.difficulty,
    status: quiz.status,
    lastUpdated: quiz.updatedAt.toISOString().split("T")[0], // YYYY-MM-DD format
  }));

  res.status(200).json(formattedQuizzes);
});

/**
 * @desc    Get a single quiz by ID
 * @route   GET /api/quizzes/:id
 * @access  Private/Admin
 */
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // Format the response to match frontend expectations
  const formattedQuiz = {
    id: quiz._id,
    title: quiz.title,
    category: quiz.category,
    difficulty: quiz.difficulty,
    duration: quiz.duration, // Return as number, frontend can format it
    status: quiz.status,
    questions: quiz.questions.map((q) => ({
      text: q.text,
      options: q.options,
      correctOption: q.correctOption,
    })),
  };

  res.status(200).json(formattedQuiz);
});

/**
 * @desc    Create a new quiz
 * @route   POST /api/quizzes
 * @access  Private/Admin
 */
const createQuiz = asyncHandler(async (req, res) => {
  const { title, category, difficulty, duration, status, questions } = req.body;

  // Validate required fields
  if (!title || !category || !difficulty || !duration) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Create new quiz
  const quiz = await Quiz.create({
    title,
    category,
    difficulty,
    duration: parseInt(duration),
    status: status || "Draft",
    questions: questions || [],
    createdBy: req.user._id,
  });

  if (quiz) {
    res.status(201).json({
      id: quiz._id,
      title: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      duration: quiz.duration,
      status: quiz.status,
      questions: quiz.questions,
    });
  } else {
    res.status(400);
    throw new Error("Invalid quiz data");
  }
});

/**
 * @desc    Update a quiz
 * @route   PUT /api/quizzes/:id
 * @access  Private/Admin
 */
const updateQuiz = asyncHandler(async (req, res) => {
  const { title, category, difficulty, duration, status, questions } = req.body;

  // Find the quiz to update
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // Update quiz fields
  quiz.title = title || quiz.title;
  quiz.category = category || quiz.category;
  quiz.difficulty = difficulty || quiz.difficulty;
  quiz.duration = duration ? parseInt(duration) : quiz.duration;
  quiz.status = status || quiz.status;

  // Only update questions if provided
  if (questions) {
    quiz.questions = questions;
  }

  // Save the updated quiz
  const updatedQuiz = await quiz.save();

  res.status(200).json({
    id: updatedQuiz._id,
    title: updatedQuiz.title,
    category: updatedQuiz.category,
    difficulty: updatedQuiz.difficulty,
    duration: updatedQuiz.duration,
    status: updatedQuiz.status,
    questions: updatedQuiz.questions,
  });
});

/**
 * @desc    Delete a quiz
 * @route   DELETE /api/quizzes/:id
 * @access  Private/Admin
 */
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  await quiz.deleteOne();
  res
    .status(200)
    .json({ id: req.params.id, message: "Quiz deleted successfully" });
});

/**
 * @desc    Get quiz categories
 * @route   GET /api/quizzes/categories
 * @access  Private/Admin
 */
const getQuizCategories = asyncHandler(async (req, res) => {
  // Find all unique categories
  const categories = await Quiz.distinct("category", {
    createdBy: req.user._id,
  });

  // Always include "All" as the first option to match frontend
  res.status(200).json(["All", ...categories]);
});

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizCategories,
};
