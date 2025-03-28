import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const categories = ['Grammar', 'Vocabulary', 'Idioms', 'Pronunciation'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

export default function CreateQuiz({ initialData = null, mode = 'create' }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: initialData || {
      title: '',
      category: '',
      difficulty: '',
      duration: ''
    }
  });
  
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctOption: 0 }]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Set form values from initialData
      setValue('title', initialData.title);
      setValue('category', initialData.category);
      setValue('difficulty', initialData.difficulty);
      setValue('duration', initialData.duration);
      
      // Set questions if they exist
      if (initialData.questions && initialData.questions.length > 0) {
        setQuestions(initialData.questions);
      }
    }
  }, [initialData, setValue]);

  const steps = [
    { title: 'Basic Information', icon: DocumentTextIcon },
    { title: 'Questions', icon: QuestionMarkCircleIcon },
    { title: 'Review', icon: AcademicCapIcon },
  ];

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOption: 0 }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'text') {
      newQuestions[index].text = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.replace('option', ''));
      newQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctOption') {
      newQuestions[index].correctOption = parseInt(value);
    }
    setQuestions(newQuestions);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to save/update the quiz
      const quizData = { ...data, questions };
      console.log('Quiz Data:', quizData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      const message = mode === 'edit' ? 'Quiz updated successfully!' : 'Quiz created successfully!';
      console.log(message);
      
      navigate('/admin/quizzes');
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700/50 transform -translate-y-1/2" />
        <div className="relative flex justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === index
                    ? 'bg-sky-500 text-white'
                    : currentStep > index
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                } transition-all duration-200`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span className="mt-2 text-sm font-medium text-slate-400">{step.title}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quiz Title
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                  placeholder="Enter quiz title"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-400">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Difficulty
                </label>
                <select
                  {...register('difficulty', { required: 'Difficulty is required' })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select difficulty</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
                {errors.difficulty && (
                  <p className="mt-2 text-sm text-red-400">{errors.difficulty.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  {...register('duration', { 
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 minute' }
                  })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                  placeholder="Enter duration in minutes"
                />
                {errors.duration && (
                  <p className="mt-2 text-sm text-red-400">{errors.duration.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {questions.map((question, questionIndex) => (
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: questionIndex * 0.1 }}
                  className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 relative group"
                >
                  <div className="absolute -top-3 -left-3 bg-slate-900 rounded-lg px-3 py-1 text-sm text-slate-400">
                    Question {questionIndex + 1}
                  </div>
                  
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                      className="absolute -top-3 -right-3 p-1.5 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500/20"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Question Text
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                        placeholder="Enter question text"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex}>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Option {optionIndex + 1}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleQuestionChange(questionIndex, `option${optionIndex}`, e.target.value)}
                              className={`w-full px-4 py-2 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200 ${
                                question.correctOption === optionIndex
                                  ? 'border-green-500/50'
                                  : 'border-slate-700/50'
                              }`}
                              placeholder={`Enter option ${optionIndex + 1}`}
                            />
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctOption === optionIndex}
                              onChange={() => handleQuestionChange(questionIndex, 'correctOption', optionIndex)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500 bg-slate-900 border-slate-700 focus:ring-green-500/50"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.button
                type="button"
                onClick={handleAddQuestion}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700/50 text-slate-400 hover:text-sky-400 hover:border-sky-500/50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Question</span>
              </motion.button>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Quiz Details</h3>
                  <div className="space-y-2">
                    <p className="text-slate-400">Title: <span className="text-white">{watch('title')}</span></p>
                    <p className="text-slate-400">Category: <span className="text-white">{watch('category')}</span></p>
                    <p className="text-slate-400">Difficulty: <span className="text-white">{watch('difficulty')}</span></p>
                    <p className="text-slate-400">Duration: <span className="text-white">{watch('duration')} minutes</span></p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Questions Overview</h3>
                  <div className="space-y-2">
                    <p className="text-slate-400">Total Questions: <span className="text-white">{questions.length}</span></p>
                    <p className="text-slate-400">Options per Question: <span className="text-white">4</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <motion.button
            type="button"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-slate-800/50 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-all duration-200"
          >
            Previous
          </motion.button>
          
          {currentStep < steps.length - 1 ? (
            <motion.button
              type="button"
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all duration-200"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{mode === 'edit' ? 'Updating Quiz...' : 'Creating Quiz...'}</span>
                </>
              ) : (
                <span>{mode === 'edit' ? 'Update Quiz' : 'Create Quiz'}</span>
              )}
            </motion.button>
          )}
        </div>
      </motion.form>
    </div>
  );
}