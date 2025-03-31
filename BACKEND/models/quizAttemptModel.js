const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOption: {
    type: Number,
    required: true,
  },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    completionTime: {
      type: Number, // In seconds
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = QuizAttempt;
