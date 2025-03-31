const express = require("express");
const router = express.Router();
const {
  getActiveQuizzes,
  getQuizForStudent,
  submitQuizAttempt,
  getQuizHistory,
} = require("../controllers/studentQuizController");
const { protect } = require("../middlewares/authMiddleware");

// Public routes that don't require authentication
router.get("/quizzes", getActiveQuizzes);
router.get("/quizzes/:id", getQuizForStudent);

// Protected routes that require authentication
router.post("/quizzes/:id/submit", protect, submitQuizAttempt);
router.get("/quiz-history", protect, getQuizHistory);

module.exports = router;
