import { useState, useEffect } from 'react';
import { SpeakerWaveIcon, StopIcon, ArrowDownTrayIcon, MicrophoneIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';

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
      border: '1px solid rgba(56, 189, 248, 0.5)',
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#0c4a6e' : state.isFocused ? '#075985' : '#1e293b',
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

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState({ value: 'en-US', label: 'English (US)' });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    pitch: 1,
    rate: 1,
    volume: 1,
  });

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!text.trim()) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language.value;
    utterance.pitch = settings.pitch;
    utterance.rate = settings.rate;
    utterance.volume = settings.volume;

    const languageVoice = voices.find(voice => 
      voice.lang.toLowerCase().includes(language.value.toLowerCase())
    );
    if (languageVoice) {
      utterance.voice = languageVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleDownload = async () => {
    if (!text.trim()) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language.value;
      utterance.pitch = settings.pitch;
      utterance.rate = settings.rate;
      utterance.volume = settings.volume;

      const languageVoice = voices.find(voice => 
        voice.lang.toLowerCase().includes(language.value.toLowerCase())
      );
      if (languageVoice) {
        utterance.voice = languageVoice;
      }

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(audioStream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'speech.wav';
        a.click();

        URL.revokeObjectURL(url);
        audioStream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      window.speechSynthesis.speak(utterance);

      utterance.onend = () => {
        mediaRecorder.stop();
      };
    } catch (error) {
      console.error('Failed to download audio:', error);
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
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <span className="text-white">Text</span>{' '}
          <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">
            To Speech
          </span>
        </motion.h1>

        <motion.div 
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-700/30 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-purple-500/10 animate-gradient-xy"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-2/3">
                <Select
                  value={language}
                  onChange={setLanguage}
                  options={languages}
                  styles={customSelectStyles}
                  className="text-sm"
                  isSearchable
                  placeholder="Select language"
                />
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-300 group"
              >
                <AdjustmentsHorizontalIcon className="w-6 h-6 text-sky-400 group-hover:text-sky-300" />
              </button>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-slate-700/30 rounded-xl p-4 space-y-4">
                    {/* Pitch control */}
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Pitch</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.pitch}
                        onChange={(e) => setSettings({ ...settings, pitch: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    {/* Rate control */}
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Speed</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.rate}
                        onChange={(e) => setSettings({ ...settings, rate: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    {/* Volume control */}
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.volume}
                        onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-48 p-4 bg-slate-900/50 text-white rounded-xl border border-slate-700/30 focus:ring-2 focus:ring-sky-500/50 focus:border-transparent resize-none placeholder-slate-400 transition-all duration-300"
                placeholder="Type your text here..."
              />
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm text-slate-400">{text.length} characters</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 mt-6">
              <motion.button
                onClick={handleSpeak}
                disabled={!text.trim()}
                className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 ${
                  isSpeaking
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-sky-500 hover:bg-sky-600'
                } disabled:opacity-50 disabled:cursor-not-allowed group`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSpeaking ? (
                  <StopIcon className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <SpeakerWaveIcon className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                )}
                <span className="text-white font-medium">
                  {isSpeaking ? 'Stop' : 'Speak'}
                </span>
              </motion.button>

              <motion.button
                onClick={handleDownload}
                disabled={!text.trim()}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowDownTrayIcon className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white font-medium">Download</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}