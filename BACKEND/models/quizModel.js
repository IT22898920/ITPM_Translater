const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Question text is required"],
    trim: true
  },
  options: {
    type: [String],
    required: [true, "Options are required"],
    validate: {
      validator: function(options) {
        return options.length >= 2; // At least two options are required
      },
      message: "A question must have at least two options"
    }
  },
  correctOption: {
    type: Number,
    required: [true, "Correct option index is required"],
    min: 0,
    validate: {
      validator: function(value) {
        return value < this.options.length;
      },
      message: "Correct option index must be valid"
    }
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Quiz title is required"],
    trim: true
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true
  },
  difficulty: {
    type: String,
    required: [true, "Difficulty level is required"],
    enum: ["Beginner", "Intermediate", "Advanced"]
  },
  duration: {
    type: Number,
    required: [true, "Duration in minutes is required"],
    min: 1
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Draft", "Archived"],
    default: "Draft"
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for question count
quizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Format the duration as "X mins" for frontend display
quizSchema.virtual('durationFormatted').get(function() {
  return `${this.duration} mins`;
});

// Override the toJSON method to include virtual properties and format dates
quizSchema.methods.toJSON = function() {
  const quiz = this.toObject();
  quiz.lastUpdated = this.updatedAt.toISOString().split('T')[0]; // YYYY-MM-DD format
  return quiz;
};

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;