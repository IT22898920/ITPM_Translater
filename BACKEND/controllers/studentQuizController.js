const asyncHandler = require("express-async-handler");
const Quiz = require("../models/quizModel");
const QuizAttempt = require("../models/quizAttemptModel");

/**
 * @desc    Get all active quizzes for students
 * @route   GET /api/student/quizzes
 * @access  Public
 */
const getActiveQuizzes = asyncHandler(async (req, res) => {
  // Only return active quizzes with limited information
  const quizzes = await Quiz.find({ status: "Active" })
    .select("title category difficulty duration")
    .sort({ updatedAt: -1 })
    .lean();

  const formattedQuizzes = quizzes.map((quiz) => ({
    id: quiz._id,
    title: quiz.title,
    category: quiz.category,
    difficulty: quiz.difficulty,
    duration: `${quiz.duration} mins`,
  }));

  res.status(200).json(formattedQuizzes);
});

/**
 * @desc    Get quiz details for taking a quiz
 * @route   GET /api/student/quizzes/:id
 * @access  Public
 */
const getQuizForStudent = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    status: "Active",
  }).select("title category difficulty duration questions");

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found or not active");
  }

  // Format the response for students (without correct answers)
  const formattedQuiz = {
    id: quiz._id,
    title: quiz.title,
    category: quiz.category,
    difficulty: quiz.difficulty,
    duration: quiz.duration,
    questions: quiz.questions.map((q) => ({
      id: q._id,
      text: q.text,
      options: q.options,
      // correctOption is intentionally omitted
    })),
  };

  res.status(200).json(formattedQuiz);
});

/**
 * @desc    Submit a quiz attempt
 * @route   POST /api/student/quizzes/:id/submit
 * @access  Private (requires user login)
 */
const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const quizId = req.params.id;

  if (!answers || !Array.isArray(answers)) {
    res.status(400);
    throw new Error("Please provide answers as an array");
  }

  // Get the quiz with correct answers for scoring
  const quiz = await Quiz.findOne({
    _id: quizId,
    status: "Active",
  });

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found or not active");
  }

  // Calculate score
  let score = 0;
  let correctAnswers = 0;

  // Map answers to question IDs for easier processing
  const userAnswers = answers.reduce((acc, ans) => {
    acc[ans.questionId] = ans.selectedOption;
    return acc;
  }, {});

  // Score each question
  quiz.questions.forEach((question) => {
    const questionId = question._id.toString();
    if (userAnswers[questionId] === question.correctOption) {
      correctAnswers++;
    }
  });

  // Calculate percentage score
  score =
    quiz.questions.length > 0
      ? (correctAnswers / quiz.questions.length) * 100
      : 0;

  // Create a quiz attempt record
  const quizAttempt = await QuizAttempt.create({
    quiz: quizId,
    user: req.user._id,
    answers: answers.map((a) => ({
      question: a.questionId,
      selectedOption: a.selectedOption,
    })),
    score,
    correctAnswers,
    totalQuestions: quiz.questions.length,
  });

  res.status(201).json({
    attemptId: quizAttempt._id,
    score: score.toFixed(2),
    correctAnswers,
    totalQuestions: quiz.questions.length,
    // Include correct answers for review
    questions: quiz.questions.map((q) => ({
      id: q._id,
      text: q.text,
      options: q.options,
      correctOption: q.correctOption,
      userSelection: userAnswers[q._id.toString()],
    })),
  });
});

/**
 * @desc    Get quiz results history for a user
 * @route   GET /api/student/quiz-history
 * @access  Private
 */
const getQuizHistory = asyncHandler(async (req, res) => {
  const quizHistory = await QuizAttempt.find({ user: req.user._id })
    .populate("quiz", "title category difficulty")
    .sort({ createdAt: -1 });

  const formattedHistory = quizHistory.map((attempt) => ({
    id: attempt._id,
    quizId: attempt.quiz._id,
    quizTitle: attempt.quiz.title,
    category: attempt.quiz.category,
    difficulty: attempt.quiz.difficulty,
    score: attempt.score.toFixed(2),
    correctAnswers: attempt.correctAnswers,
    totalQuestions: attempt.totalQuestions,
    dateTaken: attempt.createdAt,
  }));

  res.status(200).json(formattedHistory);
});

module.exports = {
  getActiveQuizzes,
  getQuizForStudent,
  submitQuizAttempt,
  getQuizHistory,
};
