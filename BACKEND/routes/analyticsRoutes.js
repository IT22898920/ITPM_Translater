const express = require("express");
const router = express.Router();
const {
  getQuizOverview,
  getQuizAnalytics,
} = require("../controllers/quizAnalyticsController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Apply protection middleware to all analytics routes
router.use(protect);
router.use(adminOnly);

// Quiz analytics endpoints
router.get("/quiz-overview", getQuizOverview);
router.get("/quizzes/:id", getQuizAnalytics);

module.exports = router;
