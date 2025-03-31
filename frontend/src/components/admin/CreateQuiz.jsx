import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  XMarkIcon,
  DocumentCheckIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { QuizService } from "../../services/quizService";
import toast from "react-hot-toast";

export default function CreateQuiz({ initialData = null, mode = "create" }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("Draft");
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([
    "Grammar",
    "Vocabulary",
    "Idioms",
    "Pronunciation",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctOption: 0,
  });
  const [errors, setErrors] = useState({});

  // Load categories from the server
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await QuizService.getCategories();
        // Remove 'All' from the categories list as it's only used for filtering
        const filteredCategories = fetchedCategories.filter(
          (cat) => cat !== "All"
        );
        if (filteredCategories.length > 0) {
          setCategories(filteredCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Initialize form with existing data for edit mode
  useEffect(() => {
    if (initialData && mode === "edit") {
      setTitle(initialData.title || "");
      setCategory(initialData.category || "");
      setDifficulty(initialData.difficulty || "Beginner");
      setDuration(initialData.duration?.toString() || "");
      setStatus(initialData.status || "Draft");
      setQuestions(initialData.questions || []);
    }
  }, [initialData, mode]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!category.trim()) newErrors.category = "Category is required";
    if (!duration.trim() || isNaN(duration) || parseInt(duration) <= 0) {
      newErrors.duration = "Duration must be a positive number";
    }

    // Validate questions
    if (questions.length === 0) {
      newErrors.questions = "At least one question is required";
    } else {
      questions.forEach((question, index) => {
        if (!question.text.trim()) {
          newErrors[`question_${index}`] = "Question text is required";
        }

        question.options.forEach((option, optIndex) => {
          if (!option.trim()) {
            newErrors[`question_${index}_option_${optIndex}`] =
              "Option text is required";
          }
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle new question form
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleCorrectOptionChange = (index) => {
    setNewQuestion({ ...newQuestion, correctOption: index });
  };

  const addQuestion = () => {
    // Validate question
    if (!newQuestion.text.trim()) {
      setErrors({ ...errors, newQuestion: "Question text is required" });
      return;
    }

    const emptyOptions = newQuestion.options.some((option) => !option.trim());
    if (emptyOptions) {
      setErrors({
        ...errors,
        newQuestionOptions: "All options must be filled",
      });
      return;
    }

    // Add question and reset form
    setQuestions([...questions, { ...newQuestion }]);
    setNewQuestion({
      text: "",
      options: ["", "", "", ""],
      correctOption: 0,
    });
    setErrors({ ...errors, newQuestion: null, newQuestionOptions: null });
  };

  // Edit existing question
  const startEditingQuestion = (index) => {
    setEditingQuestion(index);
    setNewQuestion({ ...questions[index] });
  };

  const updateQuestion = () => {
    // Validate
    if (!newQuestion.text.trim()) {
      setErrors({ ...errors, editQuestion: "Question text is required" });
      return;
    }

    const emptyOptions = newQuestion.options.some((option) => !option.trim());
    if (emptyOptions) {
      setErrors({
        ...errors,
        editQuestionOptions: "All options must be filled",
      });
      return;
    }

    // Update question
    const updatedQuestions = [...questions];
    updatedQuestions[editingQuestion] = { ...newQuestion };
    setQuestions(updatedQuestions);

    // Reset
    setEditingQuestion(null);
    setNewQuestion({
      text: "",
      options: ["", "", "", ""],
      correctOption: 0,
    });
    setErrors({ ...errors, editQuestion: null, editQuestionOptions: null });
  };

  const cancelEditingQuestion = () => {
    setEditingQuestion(null);
    setNewQuestion({
      text: "",
      options: ["", "", "", ""],
      correctOption: 0,
    });
    setErrors({ ...errors, editQuestion: null, editQuestionOptions: null });
  };

  // Question list operations
  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const moveQuestionUp = (index) => {
    if (index === 0) return;
    const updatedQuestions = [...questions];
    [updatedQuestions[index - 1], updatedQuestions[index]] = [
      updatedQuestions[index],
      updatedQuestions[index - 1],
    ];
    setQuestions(updatedQuestions);
  };

  const moveQuestionDown = (index) => {
    if (index === questions.length - 1) return;
    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[index + 1]] = [
      updatedQuestions[index + 1],
      updatedQuestions[index],
    ];
    setQuestions(updatedQuestions);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const quizData = {
        title,
        category,
        difficulty,
        duration: parseInt(duration),
        status,
        questions,
      };

      let response;

      if (mode === "edit" && initialData) {
        response = await QuizService.updateQuiz(initialData.id, quizData);
        toast.success("Quiz updated successfully!");
      } else {
        response = await QuizService.createQuiz(quizData);
        toast.success("Quiz created successfully!");
      }

      // Navigate back to quiz list
      navigate("/admin/quizzes");
    } catch (error) {
      console.error("Failed to save quiz:", error);
      toast.error(error.response?.data?.error || "Failed to save quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">
              Title
              <span className="text-sky-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 bg-slate-900/50 border ${
                errors.title ? "border-red-500" : "border-slate-700/50"
              } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200`}
              placeholder="e.g. English Grammar Basics"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">
              Category
              <span className="text-sky-500">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-2 bg-slate-900/50 border ${
                  errors.category ? "border-red-500" : "border-slate-700/50"
                } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200 appearance-none`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">
              Difficulty
              <span className="text-sky-500">*</span>
            </label>
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">
              Duration (minutes)
              <span className="text-sky-500">*</span>
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              className={`w-full px-4 py-2 bg-slate-900/50 border ${
                errors.duration ? "border-red-500" : "border-slate-700/50"
              } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200`}
              placeholder="e.g. 30"
            />
            {errors.duration && (
              <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Questions
              <span className="text-sky-500">*</span>
            </h2>
            <p className="text-sm text-slate-400">
              {questions.length} question{questions.length !== 1 ? "s" : ""}{" "}
              added
            </p>
          </div>

          {errors.questions && (
            <p className="text-red-500 text-sm">{errors.questions}</p>
          )}

          {/* Existing Questions List */}
          <div className="space-y-4">
            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50"
                >
                  {editingQuestion === index ? (
                    // Edit Question Form
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">
                          Question Text
                        </label>
                        <textarea
                          value={newQuestion.text}
                          onChange={(e) =>
                            setNewQuestion({
                              ...newQuestion,
                              text: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-2 bg-slate-800/50 border ${
                            errors.editQuestion
                              ? "border-red-500"
                              : "border-slate-700/50"
                          } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200`}
                          placeholder="Enter question text"
                          rows="2"
                        ></textarea>
                        {errors.editQuestion && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.editQuestion}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-400">
                          Options
                        </label>
                        {newQuestion.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-start space-x-2"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleCorrectOptionChange(optIndex)
                              }
                              className={`flex-shrink-0 w-6 h-6 mt-2 rounded-full ${
                                newQuestion.correctOption === optIndex
                                  ? "bg-green-500 text-white"
                                  : "bg-slate-700 text-slate-300"
                              } flex items-center justify-center`}
                            >
                              {newQuestion.correctOption === optIndex && (
                                <CheckIcon className="w-4 h-4" />
                              )}
                            </button>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(optIndex, e.target.value)
                              }
                              className={`flex-1 px-4 py-2 bg-slate-800/50 border ${
                                errors.editQuestionOptions
                                  ? "border-red-500"
                                  : "border-slate-700/50"
                              } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200`}
                              placeholder={`Option ${optIndex + 1}`}
                            />
                          </div>
                        ))}
                        {errors.editQuestionOptions && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.editQuestionOptions}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={cancelEditingQuestion}
                          className="px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          onClick={updateQuestion}
                          className="px-3 py-1 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors flex items-center space-x-1"
                        >
                          <CheckIcon className="w-4 h-4" />
                          <span>Update</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Question Display
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-white mb-2">
                          {index + 1}. {question.text}
                        </h3>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => moveQuestionUp(index)}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0
                                ? "text-slate-600 cursor-not-allowed"
                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                            } transition-colors`}
                          >
                            <ArrowUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveQuestionDown(index)}
                            disabled={index === questions.length - 1}
                            className={`p-1 rounded ${
                              index === questions.length - 1
                                ? "text-slate-600 cursor-not-allowed"
                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                            } transition-colors`}
                          >
                            <ArrowDownIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditingQuestion(index)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-700 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`px-3 py-2 rounded ${
                              question.correctOption === optIndex
                                ? "bg-green-500/20 border border-green-500/50 text-green-400"
                                : "bg-slate-800/50 border border-slate-700/50 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span
                                className={`flex-shrink-0 w-5 h-5 rounded-full ${
                                  question.correctOption === optIndex
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-700 text-slate-300"
                                } flex items-center justify-center text-xs`}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span>{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add New Question Form */}
          <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-medium text-white mb-4">
              Add New Question
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">
                  Question Text
                </label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, text: e.target.value })
                  }
                  className={`w-full px-4 py-2 bg-slate-800/50 border ${
                    errors.newQuestion
                      ? "border-red-500"
                      : "border-slate-700/50"
                  } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter question text"
                  rows="2"
                ></textarea>
                {errors.newQuestion && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newQuestion}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-400">
                  Options (select the correct one)
                </label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCorrectOptionChange(index)}
                      className={`flex-shrink-0 w-6 h-6 mt-2 rounded-full ${
                        newQuestion.correctOption === index
                          ? "bg-green-500 text-white"
                          : "bg-slate-700 text-slate-300"
                      } flex items-center justify-center`}
                    >
                      {newQuestion.correctOption === index && (
                        <CheckIcon className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className={`flex-1 px-4 py-2 bg-slate-800/50 border ${
                        errors.newQuestionOptions
                          ? "border-red-500"
                          : "border-slate-700/50"
                      } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200`}
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
                {errors.newQuestionOptions && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newQuestionOptions}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/quizzes")}
            className="px-6 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300 flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                {mode === "edit" ? (
                  <>
                    <DocumentCheckIcon className="w-5 h-5" />
                    <span>Update Quiz</span>
                  </>
                ) : (
                  <>
                    <DocumentIcon className="w-5 h-5" />
                    <span>Create Quiz</span>
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
