import { useState, useEffect } from 'react';
import { MicrophoneIcon, ClipboardIcon, ArrowPathIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';
import axios from 'axios';

// Language mapping for LanguageTool API
const languageMapping = {
  'en-US': 'en-US',
  'si-LK': 'si',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'it-IT': 'it',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'zh-CN': 'zh'
};

const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'si-LK', label: 'සිංහල (Sinhala)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'zh-CN', label: 'Chinese' },
];

const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '0.75rem',
    padding: '4px',
    boxShadow: 'none',
    '&:hover': {
      border: '1px solid rgba(74, 222, 128, 0.5)',
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#166534' : state.isFocused ? '#15803d' : '#1e293b',
    color: '#fff',
    cursor: 'pointer',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1e293b',
    borderRadius: '0.75rem',
    border: '1px solid rgba(71, 85, 105, 0.5)',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#fff',
  }),
  input: (base) => ({
    ...base,
    color: '#fff',
  }),
};

export default function SpeechToText() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState({ value: 'en-US', label: 'English (US)' });
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [grammarErrors, setGrammarErrors] = useState([]);
  const [selectedError, setSelectedError] = useState(null);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [noSpeechTimeout, setNoSpeechTimeout] = useState(null);
  const [hasDetectedSpeech, setHasDetectedSpeech] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError('');
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (isListening) {
        recognition?.stop();
        setIsListening(false);
      }
      setError('Network connection lost. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (noSpeechTimeout) {
        clearTimeout(noSpeechTimeout);
      }
    };
  }, [isListening, recognition, noSpeechTimeout]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const newRecognition = new window.webkitSpeechRecognition();
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      
      newRecognition.onstart = () => {
        setIsListening(true);
        setError('');
        setIsChangingLanguage(false);
        setHasDetectedSpeech(false);

        // Set a timeout to check if speech is detected
        const timeout = setTimeout(() => {
          if (!hasDetectedSpeech && isListening) {
            newRecognition.stop();
            setError('No speech detected. Please make sure your microphone is working and try speaking again.');
          }
        }, 5000); // 5 seconds timeout

        setNoSpeechTimeout(timeout);
      };

      newRecognition.onend = () => {
        setIsListening(false);
        if (noSpeechTimeout) {
          clearTimeout(noSpeechTimeout);
        }

        if (isOnline && !isPaused && !isChangingLanguage) {
          setError('Speech recognition ended unexpectedly. Click Start Listening to try again.');
        }
        if (isChangingLanguage) {
          try {
            newRecognition.start();
          } catch (err) {
            console.error('Failed to restart after language change:', err);
            setError('Failed to switch language. Please try again.');
            setIsChangingLanguage(false);
          }
        }
      };

      newRecognition.onresult = async (event) => {
        setHasDetectedSpeech(true);
        if (noSpeechTimeout) {
          clearTimeout(noSpeechTimeout);
        }

        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setText(transcript);
        
        // Automatically check grammar after speech recognition
        if (transcript.trim()) {
          await checkGrammar(transcript);
        }
      };

      newRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsChangingLanguage(false);

        // Don't show error for aborted recognition as it's intentional
        if (event.error === 'aborted') {
          return;
        }

        switch (event.error) {
          case 'network':
            setError('Network error occurred. Please check your internet connection and try again.');
            break;
          case 'language-not-supported':
            setError('This browser does not support the selected language. Please try another language.');
            break;
          case 'no-speech':
            setError('No speech detected. Please speak clearly into your microphone and try again.');
            break;
          case 'not-allowed':
            setError('Microphone access was denied. Please allow microphone access and try again.');
            break;
          case 'service-not-allowed':
            setError('Speech recognition service is not allowed. Please try again later.');
            break;
          default:
            setError('An error occurred. Please try again.');
        }
      };

      // Add audio level detection
      newRecognition.onaudiostart = () => {
        // Create an AudioContext to monitor audio levels
        if (navigator.mediaDevices) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const analyser = audioContext.createAnalyser();
              const microphone = audioContext.createMediaStreamSource(stream);
              microphone.connect(analyser);
              analyser.fftSize = 256;
              const bufferLength = analyser.frequencyBinCount;
              const dataArray = new Uint8Array(bufferLength);

              function checkAudioLevel() {
                if (!isListening) {
                  stream.getTracks().forEach(track => track.stop());
                  return;
                }

                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;

                if (average > 10) { // Adjust this threshold as needed
                  setHasDetectedSpeech(true);
                  if (noSpeechTimeout) {
                    clearTimeout(noSpeechTimeout);
                  }
                }

                requestAnimationFrame(checkAudioLevel);
              }

              checkAudioLevel();
            })
            .catch(err => {
              console.error('Error accessing microphone:', err);
            });
        }
      };

      setRecognition(newRecognition);
    } else {
      setError('Speech recognition is not supported in your browser.');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (noSpeechTimeout) {
        clearTimeout(noSpeechTimeout);
      }
    };
  }, []);

  const checkGrammar = async (textToCheck) => {
    if (!textToCheck.trim() || isCheckingGrammar) return;
    
    setIsCheckingGrammar(true);
    setError('');
    setGrammarErrors([]);

    try {
      // Get the correct language code for LanguageTool API
      const langCode = languageMapping[language.value] || language.value.split('-')[0];
      
      const params = new URLSearchParams();
      params.append('text', textToCheck);
      params.append('language', langCode);
      params.append('enabledOnly', 'false');

      // Add specific rules for different languages
      if (langCode === 'si') {
        params.append('disabledRules', 'WHITESPACE_RULE,UPPERCASE_SENTENCE_START');
      }

      const response = await axios.post(
        'https://api.languagetool.org/v2/check',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 15000 // 15 seconds timeout
        }
      );

      if (response.data?.matches) {
        setGrammarErrors(response.data.matches);
        if (response.data.matches.length === 0) {
          setError('No grammar errors found!');
        }
      }
    } catch (err) {
      console.error('Grammar check error:', err);
      if (err.response?.status === 400) {
        setError(`Grammar check is not supported for ${language.label}. Please try another language.`);
      } else {
        setError('Grammar check failed. Please try again later.');
      }
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const applyCorrection = (replacement) => {
    if (!selectedError) return;

    const before = text.substring(0, selectedError.offset);
    const after = text.substring(selectedError.offset + selectedError.length);
    setText(before + replacement + after);
    setGrammarErrors(grammarErrors.filter(error => error !== selectedError));
    setSelectedError(null);
  };

  const toggleListening = () => {
    if (!recognition) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    if (!isOnline) {
      setError('Please check your internet connection and try again.');
      return;
    }

    if (isListening) {
      if (noSpeechTimeout) {
        clearTimeout(noSpeechTimeout);
      }
      recognition.stop();
      setIsListening(false);
      setIsPaused(true);
    } else {
      setText('');
      recognition.lang = language.value;
      try {
        recognition.start();
        setIsPaused(false);
        setError('');
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start speech recognition. Please try again.');
      }
    }
  };

  const handleRestart = () => {
    if (!isOnline) {
      setError('Please check your internet connection and try again.');
      return;
    }

    setText('');
    setGrammarErrors([]);
    
    if (noSpeechTimeout) {
      clearTimeout(noSpeechTimeout);
    }
    
    // Always stop recognition first and update state
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
      setIsListening(false);
      setIsPaused(false);
      
      // Wait for the recognition to fully stop before starting again
      recognition.onend = () => {
        try {
          recognition.lang = language.value;
          recognition.start();
          setError('');
        } catch (err) {
          console.error('Failed to restart recognition:', err);
          setError('Failed to restart speech recognition. Please try again.');
          setIsListening(false);
          setIsPaused(true);
        }
        // Reset onend handler to original behavior
        recognition.onend = () => {
          setIsListening(false);
          if (isOnline && !isPaused && !isChangingLanguage) {
            setError('Speech recognition ended unexpectedly. Click Start Listening to try again.');
          }
        };
      };
    }
  };

  const handleResume = () => {
    if (!recognition || !isOnline) {
      setError('Please check your internet connection and try again.');
      return;
    }

    try {
      recognition.lang = language.value;
      recognition.start();
      setIsPaused(false);
      setError('');
    } catch (err) {
      console.error('Failed to resume recognition:', err);
      setError('Failed to resume speech recognition. Please try again.');
      setIsPaused(true);
      setIsListening(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy text to clipboard');
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (isListening) {
      setIsChangingLanguage(true);
      recognition.lang = newLang.value;
      recognition.stop(); // This will trigger onend, which will restart with new language
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    // Clear grammar errors when text is modified
    setGrammarErrors([]);
    setSelectedError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-6xl font-bold text-center mb-12">
          <span className="text-white">Speech</span>{' '}
          <span className="text-green-500">To Text</span>
        </h1>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-700/30">
          <div className="mb-6">
            <Select
              value={language}
              onChange={handleLanguageChange}
              options={languages}
              styles={customSelectStyles}
              className="text-sm"
              isSearchable
              placeholder="Select language"
              isDisabled={!isOnline}
            />
          </div>

          <div className="relative">
            <textarea
              value={text}
              onChange={handleTextChange}
              className="w-full h-48 p-4 bg-slate-900/50 text-white rounded-xl border border-slate-700/30 focus:ring-2 focus:ring-green-500/50 focus:border-transparent resize-none placeholder-slate-400"
              placeholder={isOnline ? "Your speech will appear here... You can also edit the text directly" : "Please check your internet connection..."}
            />
            <button
              onClick={() => checkGrammar(text)}
              disabled={!text.trim() || isCheckingGrammar}
              className="absolute bottom-4 right-4 p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Check grammar"
            >
              <CheckCircleIcon className={`h-5 w-5 ${isCheckingGrammar ? 'text-green-300 animate-spin' : 'text-green-400'}`} />
            </button>
          </div>

          {grammarErrors.length > 0 && (
            <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Grammar Suggestions:</h3>
              <div className="space-y-2">
                {grammarErrors.map((error, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedError === error ? 'bg-green-900/50' : 'bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                    onClick={() => setSelectedError(error)}
                  >
                    <p className="text-white mb-1">{error.message}</p>
                    {selectedError === error && error.replacements && error.replacements.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {error.replacements.slice(0, 3).map((replacement, i) => (
                          <button
                            key={i}
                            onClick={() => applyCorrection(replacement.value)}
                            className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded-full text-sm text-green-300 transition-all duration-300"
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
            <div className="mt-4 text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center space-x-4 mt-6">
            <button
              onClick={toggleListening}
              disabled={!isOnline || isChangingLanguage}
              className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <MicrophoneIcon className="h-5 w-5 text-white" />
              <span className="text-white font-medium">
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </span>
            </button>

            <button
              onClick={copyToClipboard}
              disabled={!text}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              <ClipboardIcon className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Copy Text</span>
              {copied && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-900/90 text-white text-xs py-1.5 px-3 rounded-full animate-fade-in-down">
                  Copied!
                </span>
              )}
            </button>

            <button
              onClick={handleRestart}
              disabled={!isOnline || isChangingLanguage}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Restart</span>
            </button>

            {isPaused && !isListening && (
              <button
                onClick={handleResume}
                disabled={!isOnline || isChangingLanguage}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Resume</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}