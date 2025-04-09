import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SynonymsPage() {
  const [word, setWord] = useState('');
  const [synonyms, setSynonyms] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!word) {
      alert("Please enter a word.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8070/synonyms/synonymSearch?word=${word}`); // Ensure the correct endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch synonyms");
      }
      const data = await response.json();
      setSynonyms(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
      setSynonyms([]); // Clear synonyms on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-4xl"
      >
        <motion.h1
          className="text-6xl font-bold text-center mb-12"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          <span className="text-white">Find</span>{' '}
          <span className="bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 text-transparent bg-clip-text">
            Synonyms
          </span>
        </motion.h1>

        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-700/30 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/5 to-blue-500/10 animate-gradient-xy"></div>

          <div className="relative z-10">
            {/* Word input */}
            <div className="relative group mb-4">
            <input
  type="text"
  value={word}
  onChange={(e) => {
    setWord(e.target.value);
    if (e.target.value.trim() === '') {
      setSynonyms([]); // Clear synonyms when input is empty
      setError(null);   // Clear error message as well
    }
  }}
  className="w-full p-4 bg-slate-900/50 text-white rounded-xl border border-slate-700/30 focus:ring-2 focus:ring-green-500/50 focus:border-transparent placeholder-slate-400 transition-all duration-300"
  placeholder="Enter a word..."
/>

            </div>

            {/* Search button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={handleSearch}
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl text-white"
              >
                Find Synonyms
              </button>
            </div>

            {/* Synonyms List */}
            {synonyms.length > 0 && (
              <motion.div
                className="mt-6 bg-gradient-to-r from-green-600/10 via-teal-700/10 to-blue-700/10 p-6 rounded-2xl shadow-lg border border-slate-700/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-semibold text-white text-center mb-4">
                  Synonyms for 
                  <span className="text-green-400"> {word}</span>
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {synonyms.map((synonym, index) => (
                    <motion.div
                      key={index}
                      className="bg-green-500/20 px-4 py-2 rounded-lg text-center text-green-300 font-medium tracking-wide transition-transform duration-300 hover:scale-105 hover:bg-green-500/30"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {synonym}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* If no synonyms found */}
            {synonyms.length === 0 && word && !error && (
              <motion.div
                className="mt-6 text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p>No synonyms found for "{word}".</p>
              </motion.div>
            )}

            {/* Display error if occurred */}
            {error && (
              <motion.div
                className="mt-6 text-red-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p>{error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
