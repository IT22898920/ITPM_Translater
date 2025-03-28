import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const mockQuizzes = [
  {
    id: 1,
    title: 'English Grammar Basics',
    category: 'Grammar',
    questions: 15,
    duration: '30 mins',
    difficulty: 'Beginner',
    status: 'Active',
    lastUpdated: '2024-02-10',
  },
  {
    id: 2,
    title: 'Advanced Vocabulary',
    category: 'Vocabulary',
    questions: 20,
    duration: '45 mins',
    difficulty: 'Advanced',
    status: 'Draft',
    lastUpdated: '2024-02-09',
  },
  {
    id: 3,
    title: 'Common English Idioms',
    category: 'Idioms',
    questions: 25,
    duration: '40 mins',
    difficulty: 'Intermediate',
    status: 'Active',
    lastUpdated: '2024-02-08',
  },
];

const categories = ['All', 'Grammar', 'Vocabulary', 'Idioms', 'Pronunciation'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const statuses = ['All', 'Active', 'Draft', 'Archived'];

export default function QuizManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [quizzes, setQuizzes] = useState(mockQuizzes);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || quiz.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === 'All' || quiz.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  const handleCreateQuiz = () => {
    navigate('/admin/quizzes/create');
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/admin/quizzes/edit/${quizId}`);
  };

  const openDeleteDialog = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setQuizToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    
    setIsDeleting(true);
    try {
      // Here you would typically make an API call to delete the quiz
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update local state
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizToDelete.id));
      closeDeleteDialog();
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500">
            Quiz Management
          </h1>
          <p className="text-slate-400">Create and manage your quizzes</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateQuiz}
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center space-x-2 text-white font-medium hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300 group"
        >
          <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Create Quiz</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 space-y-4"
      >
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:border-sky-500/50 transition-all duration-200 flex items-center space-x-2"
          >
            <span>Filters</span>
            <ChevronDownIcon className={`w-4 h-4 transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all duration-200"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quiz List */}
      <div className="space-y-4">
        {filteredQuizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-sky-500/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-white group-hover:text-sky-400 transition-colors duration-300">
                    {quiz.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    quiz.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                    quiz.status === 'Draft' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {quiz.status}
                  </span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="w-4 h-4" />
                    <span>{quiz.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <QuestionMarkCircleIcon className="w-4 h-4" />
                    <span>{quiz.questions} Questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{quiz.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>{quiz.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEditQuiz(quiz.id)}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 transition-all duration-200"
                >
                  <PencilIcon className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openDeleteDialog(quiz)}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-all duration-200"
                >
                  <TrashIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Transition appear show={deleteDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeDeleteDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-slate-700/50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium text-white">
                        Delete Quiz
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-slate-400">
                        Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={closeDeleteDialog}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteQuiz}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete Quiz</span>
                        </>
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}