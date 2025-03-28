import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, AcademicCapIcon, BookOpenIcon, LightBulbIcon, TrophyIcon, FireIcon, ChatBubbleLeftRightIcon, PencilIcon, LanguageIcon } from '@heroicons/react/24/outline';

// Enhanced quiz data with more categories and questions
const quizData = {
  vocabulary: [
    {
      question: "What is the meaning of 'Ubiquitous'?",
      options: ["Present everywhere", "Unique and rare", "Underground", "Unnecessary"],
      correct: 0,
      explanation: "'Ubiquitous' means present, appearing, or found everywhere.",
      example: "Mobile phones have become ubiquitous in modern society."
    },
    {
      question: "Choose the synonym for 'Benevolent':",
      options: ["Cruel", "Kind", "Boring", "Excited"],
      correct: 1,
      explanation: "'Benevolent' means kind, generous, and caring about others.",
      example: "The benevolent donor gave millions to charity."
    },
    {
      question: "What does 'Ephemeral' mean?",
      options: ["Lasting forever", "Very strong", "Lasting for a short time", "Very expensive"],
      correct: 2,
      explanation: "'Ephemeral' means lasting for a very short time.",
      example: "Social media trends are often ephemeral, lasting only a few days."
    },
    {
      question: "Select the synonym for 'Audacious':",
      options: ["Timid", "Bold", "Careful", "Slow"],
      correct: 1,
      explanation: "'Audacious' means showing a willingness to take bold risks.",
      example: "The company's audacious plan to colonize Mars captured everyone's imagination."
    },
    {
      question: "What is the meaning of 'Pragmatic'?",
      options: ["Emotional", "Theoretical", "Practical", "Artistic"],
      correct: 2,
      explanation: "'Pragmatic' means dealing with things sensibly and realistically.",
      example: "We need a pragmatic approach to solve this problem."
    }
  ],
  grammar: [
    {
      question: "Choose the correct sentence:",
      options: ["They is going to the store", "They are going to the store", "They am going to the store", "They be going to the store"],
      correct: 1,
      explanation: "Use 'are' with the plural pronoun 'they'.",
      example: "Subject-verb agreement: plural subjects need plural verbs."
    },
    {
      question: "Which sentence uses the correct form of 'their/there/they're'?",
      options: ["Their going to the party", "They're books are on the table", "There going to be late", "They're going to be late"],
      correct: 3,
      explanation: "'They're' is the contraction of 'they are'.",
      example: "Remember: they're = they are, their = possession, there = location"
    },
    {
      question: "Select the correct past participle:",
      options: ["I have went to the store", "I have gone to the store", "I have goed to the store", "I have going to the store"],
      correct: 1,
      explanation: "The past participle of 'go' is 'gone'.",
      example: "Irregular verb forms: go → went → gone"
    },
    {
      question: "Choose the correct relative pronoun:",
      options: ["The book who I read", "The book which I read", "The book what I read", "The book where I read"],
      correct: 1,
      explanation: "Use 'which' for things and 'who' for people.",
      example: "The car which I bought is red. The person who called is my friend."
    },
    {
      question: "Identify the correct conditional sentence:",
      options: [
        "If I will see him, I will tell him",
        "If I see him, I will tell him",
        "If I seen him, I will tell him",
        "If I sees him, I will tell him"
      ],
      correct: 1,
      explanation: "In first conditional sentences, use present simple in the if-clause.",
      example: "If it rains tomorrow, I will stay home."
    }
  ],
  idioms: [
    {
      question: "What does 'It's raining cats and dogs' mean?",
      options: ["Pets are falling from the sky", "It's raining very heavily", "It's a light drizzle", "The weather is changing"],
      correct: 1,
      explanation: "This idiom means it's raining very heavily.",
      example: "I got soaked walking home - it was raining cats and dogs!"
    },
    {
      question: "What does 'Break a leg' mean?",
      options: ["An actual injury", "A warning", "Good luck", "Take a break"],
      correct: 2,
      explanation: "'Break a leg' is a way to wish someone good luck, especially before a performance.",
      example: "Before going on stage, her friends told her to break a leg."
    },
    {
      question: "What does 'Piece of cake' mean?",
      options: ["A dessert", "Something very difficult", "Something very easy", "A small portion"],
      correct: 2,
      explanation: "'Piece of cake' means something is very easy to do.",
      example: "The test was a piece of cake - I finished it in 10 minutes!"
    },
    {
      question: "What does 'Hit the nail on the head' mean?",
      options: ["Do carpentry", "Be exactly right", "Cause pain", "Make a mistake"],
      correct: 1,
      explanation: "This idiom means to be exactly right or to describe something perfectly.",
      example: "You hit the nail on the head when you said the problem was poor communication."
    },
    {
      question: "What does 'Bite off more than you can chew' mean?",
      options: ["Eat too much", "Take on too much", "Be greedy", "Have bad teeth"],
      correct: 1,
      explanation: "This means to take on more responsibility than you can handle.",
      example: "By agreeing to organize three events at once, she bit off more than she could chew."
    }
  ],
  pronunciation: [
    {
      question: "Which word has a different pronunciation pattern?",
      options: ["though", "through", "rough", "cough"],
      correct: 0,
      explanation: "'Though' is pronounced with a long 'o' sound, while the others have 'uf' sounds.",
      example: "Though (/ðəʊ/) vs. Through (/θruː/) vs. Rough (/rʌf/) vs. Cough (/kɒf/)"
    },
    {
      question: "Which word has the stress on the second syllable?",
      options: ["photograph", "photographer", "photographic", "photography"],
      correct: 2,
      explanation: "In 'photographic', the stress falls on 'graph': pho-to-GRAPH-ic",
      example: "PHO-to-graph, pho-TO-gra-pher, pho-to-GRAPH-ic, pho-TO-gra-phy"
    },
    {
      question: "Which word has a silent 'b'?",
      options: ["bubble", "climb", "ribbon", "rubber"],
      correct: 1,
      explanation: "The 'b' in 'climb' is silent, unlike in the other words.",
      example: "Other words with silent 'b': lamb, comb, thumb"
    },
    {
      question: "Which word has a different vowel sound?",
      options: ["food", "mood", "blood", "good"],
      correct: 2,
      explanation: "'Blood' has a short 'u' sound (/ʌ/), while others have a long 'oo' sound (/uː/).",
      example: "Compare: food (/fuːd/), mood (/muːd/), blood (/blʌd/)"
    },
    {
      question: "Which word has the stress on the first syllable?",
      options: ["hotel", "begin", "above", "paper"],
      correct: 3,
      explanation: "'Paper' has the stress on 'pa': PA-per",
      example: "ho-TEL, be-GIN, a-BOVE, PA-per"
    }
  ],
  conversation: [
    {
      question: "What's the most appropriate response to 'How do you do?'",
      options: ["I'm fine, thanks", "How do you do?", "I do well", "Very well"],
      correct: 1,
      explanation: "'How do you do?' is a formal greeting, traditionally responded to with the same phrase.",
      example: "At formal events: 'How do you do?' - 'How do you do?'"
    },
    {
      question: "Which is the most polite way to disagree?",
      options: [
        "You're wrong",
        "I see your point, but...",
        "That's not right",
        "I don't agree"
      ],
      correct: 1,
      explanation: "Acknowledging someone's point before disagreeing is more polite and constructive.",
      example: "I see your point, but I think we should consider other options as well."
    },
    {
      question: "What's the best way to interrupt politely?",
      options: [
        "Hey!",
        "Excuse me, may I add something?",
        "Listen to me",
        "Stop talking"
      ],
      correct: 1,
      explanation: "Using 'excuse me' and asking permission shows respect for the speaker.",
      example: "In a meeting: 'Excuse me, may I add something to that point?'"
    },
    {
      question: "Which is the most appropriate way to end a formal email?",
      options: [
        "See you!",
        "Best regards,",
        "Bye!",
        "Talk to you later"
      ],
      correct: 1,
      explanation: "'Best regards' is a professional and widely accepted email closing.",
      example: "Dear Mr. Smith, ... Best regards, Jane Doe"
    },
    {
      question: "What's the best response to a compliment?",
      options: [
        "I know",
        "Thank you, that's very kind",
        "Whatever",
        "No, you're wrong"
      ],
      correct: 1,
      explanation: "Expressing gratitude is the most appropriate way to receive a compliment.",
      example: "Nice presentation! - Thank you, that's very kind of you to say."
    }
  ]
};

const categoryIcons = {
  vocabulary: BookOpenIcon,
  grammar: AcademicCapIcon,
  idioms: LightBulbIcon,
  pronunciation: ChatBubbleLeftRightIcon,
  conversation: LanguageIcon
};

const categoryDescriptions = {
  vocabulary: "Enhance your word power with advanced vocabulary",
  grammar: "Master English grammar rules and structures",
  idioms: "Learn common English expressions and their meanings",
  pronunciation: "Perfect your English pronunciation and accent",
  conversation: "Improve your conversational English skills"
};

export default function EnglishQuiz() {
  const [currentCategory, setCurrentCategory] = useState('vocabulary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [animation, setAnimation] = useState('');
  const [showCategorySelection, setShowCategorySelection] = useState(true);

  const currentQuestion = quizData[currentCategory][currentQuestionIndex];
  const CategoryIcon = categoryIcons[currentCategory];

  useEffect(() => {
    const savedBestStreak = localStorage.getItem('englishQuizBestStreak');
    if (savedBestStreak) {
      setBestStreak(parseInt(savedBestStreak));
    }
  }, []);

  const handleCategorySelect = (category) => {
    setCurrentCategory(category);
    setShowCategorySelection(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
    
    if (answerIndex === currentQuestion.correct) {
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setAnimation('correct');
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem('englishQuizBestStreak', newStreak.toString());
      }
    } else {
      setStreak(0);
      setAnimation('incorrect');
    }
    
    setShowExplanation(true);
    setTimeout(() => setAnimation(''), 500);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowAnswer(false);
    setAnimation('');

    if (currentQuestionIndex < quizData[currentCategory].length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    setShowCategorySelection(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizCompleted(false);
    setShowAnswer(false);
    setAnimation('');
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + (selectedAnswer !== null ? 1 : 0)) / quizData[currentCategory].length) * 100;
  };

  if (showCategorySelection) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              English Learning Quiz
            </span>
          </h1>
          <p className="text-slate-300 text-center mb-12 text-lg">
            Choose a category to start improving your English skills
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(quizData).map((category) => {
              const Icon = categoryIcons[category];
              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 group"
                >
                  <Icon className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:text-blue-300 transition-colors duration-300" />
                  <h3 className="text-xl font-semibold text-white mb-2 capitalize">
                    {category}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {categoryDescriptions[category]}
                  </p>
                  <div className="mt-4 text-blue-400 text-sm">
                    {quizData[category].length} questions
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const totalQuestions = quizData[currentCategory].length;
    const percentage = (score / totalQuestions) * 100;
    
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-700/30 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-xy"></div>
            <div className="relative z-10">
              <TrophyIcon className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-bounce-gentle" />
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6">
                Quiz Completed!
              </h2>
              <div className="text-6xl font-bold mb-8 animate-pulse-slow">
                <span className="text-blue-400">{score}</span>
                <span className="text-slate-400">/{totalQuestions}</span>
              </div>
              <div className="mb-8">
                <div className="text-2xl font-semibold text-white mb-2">
                  {percentage >= 80 ? '🎉 Excellent!' :
                   percentage >= 60 ? '👍 Good Job!' :
                   '💪 Keep Practicing!'}
                </div>
                <div className="text-slate-300 text-lg">
                  You scored {percentage.toFixed(1)}%
                </div>
              </div>
              <div className="mb-8 flex justify-center items-center space-x-8">
                <div className="text-center">
                  <FireIcon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-lg text-slate-300">Best Streak</div>
                  <div className="text-3xl font-bold text-orange-400">{bestStreak}</div>
                </div>
                <div className="text-center">
                  <AcademicCapIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-lg text-slate-300">Correct Answers</div>
                  <div className="text-3xl font-bold text-blue-400">{score}</div>
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleCategorySelect(currentCategory)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center space-x-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 group"
                >
                  <ArrowPathIcon className="h-6 w-6 text-white group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-white font-medium text-lg">Retry Category</span>
                </button>
                <button
                  onClick={restartQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center space-x-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 group"
                >
                  <PencilIcon className="h-6 w-6 text-white" />
                  <span className="text-white font-medium text-lg">Choose Category</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-700/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-xy"></div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <CategoryIcon className="w-8 h-8 text-blue-400" />
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 capitalize">
                    {currentCategory} Quiz
                  </h2>
                </div>
                <div className="text-slate-300 font-medium">
                  Question {currentQuestionIndex + 1}/{quizData[currentCategory].length}
                </div>
              </div>
              <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-slate-400 mb-1">Score</div>
                    <div className="text-xl font-bold text-blue-400">{score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400 mb-1">Streak</div>
                    <div className="text-xl font-bold text-orange-400">{streak}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Best</div>
                  <div className="text-xl font-bold text-purple-400">{bestStreak}</div>
                </div>
              </div>
            </div>

            <div className={`mb-8 transition-all duration-300 ${animation === 'correct' ? 'scale-102' : animation === 'incorrect' ? 'shake' : ''}`}>
              <h2 className="text-xl font-semibold text-white mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      selectedAnswer === null
                        ? 'bg-slate-700/50 hover:bg-slate-600/50 hover:shadow-lg hover:shadow-blue-500/10'
                        : showAnswer && index === currentQuestion.correct
                        ? 'bg-green-600/20 border border-green-500/50'
                        : showAnswer && index === selectedAnswer
                        ? 'bg-red-600/20 border border-red-500/50'
                        : 'bg-slate-700/50'
                    } ${
                      selectedAnswer === null ? 'hover:scale-102 hover:translate-x-1' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-white text-lg">{option}</span>
                      {showAnswer && index === currentQuestion.correct && (
                        <CheckCircleIcon className="h-6 w-6 text-green-500 ml-auto animate-scale-fade" />
                      )}
                      {showAnswer && index === selectedAnswer && index !== currentQuestion.correct && (
                        <XCircleIcon className="h-6 w-6 text-red-500 ml-auto animate-scale-fade" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {showExplanation && (
              <div className="mb-8 space-y-4">
                <div className="p-4 bg-blue-900/30 rounded-xl border border-blue-500/30">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Explanation</h3>
                  <p className="text-slate-300">{currentQuestion.explanation}</p>
                </div>
                <div className="p-4 bg-purple-900/30 rounded-xl border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Example</h3>
                  <p className="text-slate-300 italic">{currentQuestion.example}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              {selectedAnswer !== null && (
                <button
                  onClick={nextQuestion}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl transition-all duration-300 hover:scale-102 hover:shadow-lg hover:shadow-blue-500/25 group"
                >
                  <span className="text-white font-medium text-lg group-hover:tracking-wider transition-all duration-300">
                    {currentQuestionIndex === quizData[currentCategory].length - 1
                      ? 'Complete Quiz'
                      : 'Next Question'}
                  </span>
                </button>
              )}
              <button
                onClick={restartQuiz}
                className="px-6 py-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 group"
              >
                <ArrowPathIcon className="h-6 w-6 text-white group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}