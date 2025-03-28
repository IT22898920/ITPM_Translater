import { useState } from "react";
import {
  ClipboardIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";
import { KeywordService } from "../services/apiService";

const languages = [
  { value: "en", label: "English" },
  { value: "si", label: "සිංහල (Sinhala)" },
];

const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(71, 85, 105, 0.5)",
    borderRadius: "0.75rem",
    padding: "4px",
    boxShadow: "none",
    "&:hover": {
      border: "1px solid rgba(37, 99, 235, 0.5)",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#1d4ed8"
      : state.isFocused
      ? "#2563eb"
      : "#1e293b",
    color: "#fff",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1e293b",
    borderRadius: "0.75rem",
    border: "1px solid rgba(71, 85, 105, 0.5)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
  }),
};

export default function KeywordAbstractor() {
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState({ value: "en", label: "English" });
  const [maxKeywords, setMaxKeywords] = useState(10); // Default max keywords limit

  const extractKeywords = async () => {
    if (!text.trim()) {
      setError(
        language.value === "si"
          ? "කරුණාකර විශ්ලේෂණය කිරීමට පෙළ ඇතුළත් කරන්න"
          : "Please enter text to analyze"
      );
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      let extractedKeywords;

      if (language.value === "si") {
        // Use the backend API for Sinhala keyword extraction
        extractedKeywords = await KeywordService.extractSinhalaKeywords(
          text,
          maxKeywords
        );
      } else {
        // Use the backend API for English keyword extraction
        extractedKeywords = await KeywordService.extractEnglishKeywords(
          text,
          maxKeywords
        );
      }

      setKeywords(extractedKeywords || []);

      if (!extractedKeywords || extractedKeywords.length === 0) {
        setError(
          language.value === "si"
            ? "පෙළෙහි මුල් පද හමු නොවීය. වැඩි විස්තරාත්මක අන්තර්ගතයක් එකතු කිරීමට උත්සාහ කරන්න."
            : "No keywords found in the text. Try adding more descriptive content."
        );
      }
    } catch (err) {
      console.error("Keyword extraction error:", err);
      setError(
        language.value === "si"
          ? "මුල් පද උපුටා ගැනීම අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න."
          : "Failed to extract keywords. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setText("");
    setKeywords([]);
    setError("");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(keywords.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError(
        language.value === "si"
          ? "මුල් පද පසුරු පුවරුවට පිටපත් කිරීමට අසමත් විය"
          : "Failed to copy keywords to clipboard"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-6xl font-bold text-center mb-12">
          <span className="text-white">Keyword</span>{" "}
          <span className="text-blue-500">Abstractor</span>
        </h1>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-700/30">
          <div className="mb-6">
            <Select
              value={language}
              onChange={(newLang) => {
                setLanguage(newLang);
                setKeywords([]);
                setError("");
              }}
              options={languages}
              styles={customSelectStyles}
              className="text-sm"
              isSearchable={false}
              aria-label="Select language"
            />
          </div>

          <div className="mb-6">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError("");
              }}
              className="w-full h-48 p-4 bg-slate-900/50 text-white rounded-xl border border-slate-700/30 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none placeholder-slate-400"
              placeholder={
                language.value === "si"
                  ? "මුල් පද උපුටා ගැනීමට පෙළ මෙහි ඇතුළත් කරන්න..."
                  : "Enter your text here to extract keywords..."
              }
            />
          </div>

          <div className="mb-6">
            <label htmlFor="maxKeywords" className="block text-slate-300 mb-2">
              {language.value === "si"
                ? "උපරිම මූල පද ගණන:"
                : "Maximum keywords:"}
            </label>
            <div className="flex items-center">
              <input
                id="maxKeywords"
                type="range"
                min="5"
                max="50"
                value={maxKeywords}
                onChange={(e) => setMaxKeywords(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-3 w-10 text-center text-white">
                {maxKeywords}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {language.value === "si"
                ? 'සියල්ල ලබා ගැනීමට "50" තෝරන්න'
                : 'Select "50" to get all available keywords (limited to 50)'}
            </div>
          </div>

          {keywords.length > 0 && (
            <div className="mb-6">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-blue-700/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                  {language.value === "si" ? "මුල් පද:" : "Keywords:"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 bg-blue-900/20 rounded-lg text-white"
                    >
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-400 text-center">{error}</div>
          )}

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={extractKeywords}
              disabled={!text.trim() || isProcessing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChartBarIcon
                className={`h-5 w-5 text-white ${
                  isProcessing ? "animate-pulse" : ""
                }`}
              />
              <span className="text-white font-medium">
                {isProcessing
                  ? language.value === "si"
                    ? "සකසමින්..."
                    : "Processing..."
                  : language.value === "si"
                  ? "මුල් පද උපුටා ගන්න"
                  : "Extract Keywords"}
              </span>
            </button>

            {keywords.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-2 transition-all duration-300 relative"
                >
                  <ClipboardIcon className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    {language.value === "si"
                      ? "මුල් පද පිටපත් කරන්න"
                      : "Copy Keywords"}
                  </span>
                  {copied && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-900/90 text-white text-xs py-1.5 px-3 rounded-full animate-fade-in-down">
                      {language.value === "si" ? "පිටපත් කරන ලදී!" : "Copied!"}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-2 transition-all duration-300"
                >
                  <ArrowPathIcon className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    {language.value === "si" ? "යළි පිහිටුවන්න" : "Reset"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
