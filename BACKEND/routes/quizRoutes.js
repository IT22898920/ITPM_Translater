const express = require("express");
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizCategories,
} = require("../controllers/quizController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Apply protect middleware to all quiz routes
router.use(protect);
router.use(adminOnly);

// Quiz categories endpoint
router.get("/categories", getQuizCategories);

// Quiz CRUD operations
router.route("/").get(getQuizzes).post(createQuiz);

router.route("/:id").get(getQuizById).put(updateQuiz).delete(deleteQuiz);

module.exports = router;
