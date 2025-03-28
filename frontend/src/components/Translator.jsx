import { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon, ClipboardIcon, SpeakerWaveIcon, MicrophoneIcon, CheckCircleIcon, ClockIcon, XMarkIcon, ChevronDownIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';
import { translateText } from '../utils/translate';
import { checkGrammar } from '../utils/grammar';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'si', label: 'සිංහල (Sinhala)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'tr', label: 'Turkish' },
  { value: 'nl', label: 'Dutch' },
  { value: 'pl', label: 'Polish' },
];

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(30, 41, 59, 0.5)',
    boxShadow: 'none',
    '&:hover': {
      border: '1px solid rgba(56, 189, 248, 0.5)',
    },
    borderColor: state.isFocused ? 'rgba(56, 189, 248, 0.5)' : 'rgba(30, 41, 59, 0.5)',
    color: '#fff',
    borderRadius: '0.75rem',
    padding: '4px',
    transition: 'all 0.3s ease',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#0c4a6e' : state.isFocused ? '#075985' : '#0f172a',
    color: '#fff',
    '&:active': {
      backgroundColor: '#0c4a6e',
    },
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '10px 12px',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#0f172a',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid rgba(30, 41, 59, 0.5)',
    animation: 'scale-fade 0.2s ease-out',
    zIndex: 50,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(12px)',
  }),
  menuList: (base) => ({
    ...base,
    padding: '6px',
    maxHeight: '250px',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(31, 41, 55, 0.5)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(56, 189, 248, 0.3)',
      borderRadius: '4px',
      '&:hover': {
        background: 'rgba(56, 189, 248, 0.5)',
      },
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#fff',
  }),
  input: (base) => ({
    ...base,
    color: '#fff',
  }),
  container: (base) => ({
    ...base,
    zIndex: 30,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'rgba(56, 189, 248, 0.5)',
    '&:hover': {
      color: 'rgba(56, 189, 248, 0.8)',
    },
  }),
};

export default function Translator() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState({ value: 'en', label: 'English' });
  const [targetLang, setTargetLang] = useState({ value: 'si', label: 'සිංහල (Sinhala)' });
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState({ source: false, target: false });
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [grammarErrors, setGrammarErrors] = useState([]);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem('translationHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sourceLang.value === 'si' ? 'si-LK' : 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setSourceText(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'language-not-supported') {
          setError('This browser does not support Sinhala voice input. Please try English instead.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }

    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [sourceLang]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    setError('');

    try {
      const result = await translateText(sourceText, sourceLang.value, targetLang.value);
      setTranslatedText(result);

      const newHistoryItem = {
        id: Date.now(),
        sourceText,
        translatedText: result,
        sourceLang: sourceLang.value,
        targetLang: targetLang.value,
        timestamp: new Date().toISOString(),
      };

      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 10);
        return updatedHistory;
      });
    } catch (err) {
      setError('Translation failed. Please try again later.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!sourceText.trim()) return;
    
    setIsCheckingGrammar(true);
    setError('');
    setGrammarErrors([]);

    try {
      const errors = await checkGrammar(sourceText, sourceLang.value);
      setGrammarErrors(errors);
      if (errors.length === 0) {
        setError(sourceLang.value === 'si' ? 'ව්‍යාකරණ දෝෂ හමු නොවීය!' : 'No grammar errors found!');
      }
    } catch (err) {
      setError(sourceLang.value === 'si' ? 
        'ව්‍යාකරණ පරීක්ෂාව අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.' : 
        'Grammar check failed. Please try again later.');
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const applyCorrection = (replacement) => {
    if (!selectedError) return;

    const before = sourceText.substring(0, selectedError.offset);
    const after = sourceText.substring(selectedError.offset + selectedError.length);
    setSourceText(before + replacement + after);
    setGrammarErrors(grammarErrors.filter(error => error !== selectedError));
    setSelectedError(null);
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const speakText = (text, lang) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (lang.value === 'si') {
      utterance.lang = 'si-LK';
      const sinhalaVoice = voices.find(voice => 
        voice.lang.toLowerCase().includes('si') || 
        voice.lang.toLowerCase().includes('sin')
      );
      if (sinhalaVoice) {
        utterance.voice = sinhalaVoice;
      }
      utterance.pitch = 1.0;
      utterance.rate = 0.9;
    } else {
      utterance.lang = lang.value;
      const languageVoice = voices.find(voice => 
        voice.lang.toLowerCase().includes(lang.value.toLowerCase())
      );
      if (languageVoice) {
        utterance.voice = languageVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError(lang.value === 'si' ? 
        'කථන යන්ත්‍රය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.' : 
        'Speech synthesis failed. Please try again.');
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognition) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setSourceText('');
      recognition.lang = sourceLang.value === 'si' ? 'si-LK' : 'en-US';
      recognition.start();
      setIsListening(true);
    }
  };

  const loadFromHistory = (historyItem) => {
    setSourceText(historyItem.sourceText);
    setTranslatedText(historyItem.translatedText);
    setSourceLang(languages.find(lang => lang.value === historyItem.sourceLang));
    setTargetLang(languages.find(lang => lang.value === historyItem.targetLang));
  };

  const removeFromHistory = (id) => {
    setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    setShowHistory(false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="glass-effect rounded-2xl shadow-2xl p-8 backdrop-blur-xl border border-slate-700/30 hover:shadow-sky-900/20 transition-all duration-500">
      <div className="flex items-center justify-between mb-8 space-x-4 relative z-20">
        <div className="w-[45%] transform hover:scale-102 transition-transform duration-300">
          <Select
            value={sourceLang}
            onChange={(newLang) => {
              setSourceLang(newLang);
              if (isListening) {
                recognition.stop();
              }
            }}
            options={languages}
            styles={customSelectStyles}
            className="text-sm"
            isSearchable
            placeholder="Select source language"
            aria-label="Source language"
          />
        </div>

        <button
          onClick={swapLanguages}
          className="p-3 rounded-full hover:bg-sky-900/30 transition-all duration-300 group animate-bounce-gentle"
          aria-label="Swap languages"
        >
          <ArrowsRightLeftIcon className="h-6 w-6 text-sky-400 group-hover:scale-110 transition-transform duration-300" />
        </button>

        <div className="w-[45%] transform hover:scale-102 transition-transform duration-300">
          <Select
            value={targetLang}
            onChange={setTargetLang}
            options={languages}
            styles={customSelectStyles}
            className="text-sm"
            isSearchable
            placeholder="Select target language"
            aria-label="Target language"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="relative group transform hover:scale-101 transition-all duration-300">
          <textarea
            value={sourceText}
            onChange={(e) => {
              setSourceText(e.target.value);
              setGrammarErrors([]);
            }}
            className="w-full h-64 p-5 pb-16 bg-slate-900/80 text-slate-100 border border-slate-700/30 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-transparent resize-none backdrop-blur-sm transition-all duration-300 placeholder-slate-400 hover:border-sky-500/30"
            placeholder={sourceLang.value === 'si' ? 
              'පරිවර්තනය සඳහා පෙළ ඇතුළත් කරන්න... (කතා කිරීමට මයික් අයිකනය ක්ලික් කරන්න)' : 
              'Enter text to translate... (Click mic icon to speak)'}
          />
          <div className="absolute bottom-4 right-4 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg ${isListening ? 'bg-red-500/90' : 'bg-slate-800/90'} hover:bg-sky-900/30 transition-all duration-300 group backdrop-blur-sm shadow-inner`}
              aria-label={isListening ? 'Stop listening' : 'Start speech recognition'}
            >
              <MicrophoneIcon className={`h-5 w-5 ${isListening ? 'text-white animate-pulse' : 'text-sky-400'} group-hover:scale-110 transition-transform duration-300`} />
            </button>
            <button
              onClick={handleGrammarCheck}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-sky-900/30 transition-all duration-300 group backdrop-blur-sm shadow-inner"
              disabled={!sourceText || isCheckingGrammar}
              aria-label="Check grammar"
            >
              <CheckCircleIcon className={`h-5 w-5 ${isCheckingGrammar ? 'text-yellow-400 animate-spin' : 'text-sky-400'} group-hover:scale-110 transition-transform duration-300`} />
            </button>
            <button
              onClick={() => speakText(sourceText, sourceLang)}
              className={`p-2 rounded-lg bg-slate-800/90 hover:bg-sky-900/30 transition-all duration-300 group backdrop-blur-sm shadow-inner ${isSpeaking ? 'bg-sky-600/50' : ''}`}
              disabled={!sourceText}
              aria-label="Speak source text"
            >
              <SpeakerWaveIcon className={`h-5 w-5 ${isSpeaking ? 'text-white animate-pulse' : 'text-sky-400'} group-hover:scale-110 transition-transform duration-300`} />
            </button>
            <button
              onClick={() => copyToClipboard(sourceText, 'source')}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-sky-900/30 transition-all duration-300 group relative backdrop-blur-sm shadow-inner"
              disabled={!sourceText}
              aria-label="Copy source text"
            >
              <ClipboardIcon className="h-5 w-5 text-sky-400 group-hover:scale-110 transition-transform duration-300" />
              {copied.source && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-sky-900/90 text-white text-xs py-1.5 px-3 rounded-full animate-fade-in-down backdrop-blur-sm shadow-lg">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="relative group transform hover:scale-101 transition-all duration-300">
          <textarea
            value={translatedText}
            readOnly
            className="w-full h-64 p-5 pb-16 bg-slate-900/80 text-slate-100 border border-slate-700/30 rounded-xl resize-none backdrop-blur-sm placeholder-slate-400 hover:border-sky-500/30 transition-all duration-300"
            placeholder={targetLang.value === 'si' ? 
              'පරිවර්තනය මෙහි දිස් වනු ඇත...' : 
              'Translation will appear here...'}
          />
          <div className="absolute bottom-4 right-4 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={() => speakText(translatedText, targetLang)}
              className={`p-2 rounded-lg bg-slate-800/90 hover:bg-sky-900/30 transition-all duration-300 group backdrop-blur-sm shadow-inner ${isSpeaking ? 'bg-sky-600/50' : ''}`}
              disabled={!translatedText}
              aria-label="Speak translated text"
            >
              <SpeakerWaveIcon className={`h-5 w-5 ${isSpeaking ? 'text-white animate-pulse' : 'text-sky-400'} group-hover:scale-110 transition-transform duration-300`} />
            </button>
            <button
              onClick={() => copyToClipboard(translatedText, 'target')}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-sky-900/30 transition-all duration-300 group relative backdrop-blur-sm shadow-inner"
              disabled={!translatedText}
              aria-label="Copy translated text"
            >
              <ClipboardIcon className="h-5 w-5 text-sky-400 group-hover:scale-110 transition-transform duration-300" />
              {copied.target && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-sky-900/90 text-white text-xs py-1.5 px-3 rounded-full animate-fade-in-down backdrop-blur-sm shadow-lg">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 relative"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2 text-slate-400 hover:text-sky-400 transition-colors duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ClockIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-medium">Translation History</span>
            <ChevronDownIcon 
              className={`w-4 h-4 transform transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}
            />
          </motion.button>
          {history.length > 0 && (
            <motion.button
              onClick={clearHistory}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TrashIcon className="w-4 h-4" />
              <span className="text-sm">Clear History</span>
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {history.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30"
                >
                  <ArrowPathIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No translation history yet</p>
                  <p className="text-sm text-slate-500">Your recent translations will appear here</p>
                </motion.div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-slate-800/30 rounded-xl p-6 border border-slate-700/30 hover:border-sky-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <ClockIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400">{formatTimestamp(item.timestamp)}</span>
                          </div>
                          <div className="h-4 w-px bg-slate-700" />
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-slate-300">
                              {languages.find(lang => lang.value === item.sourceLang)?.label}
                            </span>
                            <ArrowsRightLeftIcon className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-300">
                              {languages.find(lang => lang.value === item.targetLang)?.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.button
                            onClick={() => loadFromHistory(item)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors duration-200"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => removeFromHistory(item.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors duration-200"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Source Text</div>
                          <p className="text-sm text-slate-300 line-clamp-2">{item.sourceText}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Translation</div>
                          <p className="text-sm text-slate-300 line-clamp-2">{item.translatedText}</p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute bottom-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.button
                          onClick={() => speakText(item.sourceText, { value: item.sourceLang })}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-sky-400 transition-colors duration-200"
                        >
                          <SpeakerWaveIcon className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => copyToClipboard(item.translatedText, 'target')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-sky-400 transition-colors duration-200"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {grammarErrors.length > 0 && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-sky-400 mb-2">
            {sourceLang.value === 'si' ? 'ව්‍යාකරණ යෝජනා:' : 'Grammar Suggestions:'}
          </h3>
          <div className="space-y-2">
            {grammarErrors.map((error, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedError === error ? 'bg-sky-900/50' : 'bg-slate-700/30 hover:bg-slate-700/50'
                }`}
                onClick={() => setSelectedError(error)}
              >
                <p className="text-white mb-1">{error.message}</p>
                {selectedError === error && error.replacements.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {error.replacements.slice(0, 3).map((replacement, i) => (
                      <button
                        key={i}
                        onClick={() =>applyCorrection(replacement.value)}
                        className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 rounded-full text-sm text-sky-300 transition-all duration-300"
                      >
                        {replacement.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-400 text-center animate-pulse-slow">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleTranslate}
          disabled={!sourceText || isTranslating}
          className="relative px-8 py-4 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition-all duration-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-sky-500/25 disabled:hover:scale-100 disabled:hover:shadow-lg overflow-hidden group"
          aria-label="Translate now"
        >
          <span className={`relative z-10 inline-flex items-center transition-all duration-300 ${isTranslating ? 'opacity-0' : 'opacity-100'}`}>
            {sourceLang.value === 'si' ? 'දැන් පරිවර්තනය කරන්න' : 'Translate Now'}
          </span>
          {isTranslating && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}