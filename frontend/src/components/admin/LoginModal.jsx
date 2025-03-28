import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, KeyIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useAdminStore } from '../../stores/adminStore';
import { motion, AnimatePresence } from 'framer-motion';

function Particles() {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 bg-gradient-to-br from-sky-400 to-purple-400 rounded-full';
      
      // Random position
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      // Random animation duration and delay
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 2;
      
      particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
      particle.style.opacity = '0.3';
      
      document.getElementById('particle-container').appendChild(particle);
      
      setTimeout(() => particle.remove(), duration * 1000);
    };

    const interval = setInterval(createParticle, 200);
    return () => clearInterval(interval);
  }, []);

  return <div id="particle-container" className="absolute inset-0 pointer-events-none overflow-hidden" />;
}

export default function LoginModal({ isOpen, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();
  const login = useAdminStore(state => state.login);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoginError('');
      const success = await login(data.username, data.password);
      if (success) {
        onClose();
      }
    } catch (error) {
      setLoginError(error.message);
      setError('username', { type: 'manual' });
      setError('password', { type: 'manual' });
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-lg" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-slate-800/90 backdrop-blur-xl p-8 text-left align-middle shadow-xl transition-all border border-slate-700/50 relative">
                {/* Particle effects */}
                <Particles />

                {/* Background video with enhanced overlay */}
                <div className="absolute inset-0 overflow-hidden">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-10"
                  >
                    <source
                      src="https://assets.codepen.io/2621168/abstract_animation.mp4"
                      type="video/mp4"
                    />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-slate-800/50 to-purple-500/10" />
                  
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-purple-500/20 animate-gradient-xy opacity-30" />
                </div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left side - Login form */}
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                      <Dialog.Title as="div">
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative"
                        >
                          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500">
                            Welcome Back
                          </h3>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="absolute -bottom-2 h-px bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500"
                          />
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-slate-400 text-sm mt-3"
                        >
                          Enter your credentials to access the admin dashboard
                        </motion.p>
                      </Dialog.Title>
                      
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
                        >
                          <p className="text-sm text-red-400">{loginError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                          Username
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 rounded-xl opacity-50 group-hover:opacity-100 blur transition-opacity duration-500" />
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <UserIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                              type="text"
                              id="username"
                              {...register('username', { required: 'Username is required' })}
                              className={`block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border ${
                                errors.username ? 'border-red-500/50' : 'border-slate-700/50'
                              } text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                                errors.username ? 'focus:ring-red-500/50' : 'focus:ring-sky-500/50'
                              } focus:border-transparent transition-all duration-200`}
                              placeholder="Enter your username"
                            />
                          </div>
                        </div>
                        {errors.username && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-400"
                          >
                            {errors.username.message}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                          Password
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 rounded-xl opacity-50 group-hover:opacity-100 blur transition-opacity duration-500" />
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <KeyIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              {...register('password', { required: 'Password is required' })}
                              className={`block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border ${
                                errors.password ? 'border-red-500/50' : 'border-slate-700/50'
                              } text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                                errors.password ? 'focus:ring-red-500/50' : 'focus:ring-sky-500/50'
                              } focus:border-transparent transition-all duration-200`}
                              placeholder="Enter your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              <SparklesIcon className="h-5 w-5 text-slate-400 hover:text-sky-400 transition-colors" />
                            </button>
                          </div>
                        </div>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-400"
                          >
                            {errors.password.message}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full relative py-3 px-4 rounded-xl text-white overflow-hidden group transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 transition-all duration-300 group-hover:scale-102" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {isSubmitting ? (
                          <div className="relative flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        ) : (
                          <span className="relative font-medium">Login to Dashboard</span>
                        )}
                      </motion.button>
                    </form>
                  </div>

                  {/* Right side - Welcome animation */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="hidden md:flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-sky-500/5 via-blue-500/5 to-purple-500/5 border border-slate-700/30"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="relative w-32 h-32 mb-8"
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 animate-spin-slow blur-md" />
                      <div className="relative w-full h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 p-1">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                          <span className="text-4xl animate-bounce-gentle">👋</span>
                        </div>
                      </div>
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 mb-4 text-center">
                      Welcome Back!
                    </h3>
                    <p className="text-slate-400 text-center">
                      Access your dashboard to manage users, quizzes, and view analytics.
                    </p>
                  </motion.div>
                </div>

                {/* Default credentials */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative z-10 mt-8 text-center space-y-2"
                >
                  <p className="text-sm text-slate-400">Default credentials:</p>
                  <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-700/30">
                    <p className="text-sm text-slate-300">Username: <span className="text-sky-400">admin</span></p>
                    <p className="text-sm text-slate-300">Password: <span className="text-sky-400">admin</span></p>
                  </div>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}