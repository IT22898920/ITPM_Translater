import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import CreateQuiz from './CreateQuiz';

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Here you would typically fetch the quiz data from your API
    // For now, we'll simulate an API call with mock data
    const fetchQuiz = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock quiz data
        const mockQuiz = {
          id: parseInt(id),
          title: 'English Grammar Basics',
          category: 'Grammar',
          difficulty: 'Beginner',
          duration: 30,
          questions: [
            {
              text: 'What is a verb?',
              options: [
                'A doing word',
                'A naming word',
                'A describing word',
                'A connecting word'
              ],
              correctOption: 0
            },
            {
              text: 'Which sentence is in the past tense?',
              options: [
                'I am going to school',
                'I went to school',
                'I will go to school',
                'I go to school'
              ],
              correctOption: 1
            }
          ]
        };
        
        setQuiz(mockQuiz);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-sky-500 border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-2 border-sky-500/20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => navigate('/admin/quizzes')}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-white transition-all duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-slate-400">Quiz not found</p>
        <button
          onClick={() => navigate('/admin/quizzes')}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-white transition-all duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500">
              Edit Quiz
            </h1>
            <p className="text-slate-400 mt-1">Update your quiz details and questions</p>
          </div>
        </motion.div>
      </div>

      {/* Quiz Form */}
      <CreateQuiz initialData={quiz} mode="edit" />
    </div>
  );
}