// src/services/apiService.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Service for interacting with the keyword extraction API
 */
export const KeywordService = {
  /**
   * Extract keywords from English text
   * @param {string} text - The text to extract keywords from
   * @param {number|null} maxKeywords - Optional maximum number of keywords to return
   * @returns {Promise<string[]>} Array of extracted keywords
   */
  extractEnglishKeywords: async (text, maxKeywords = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/extract_keywords`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          max_keywords: maxKeywords,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract keywords");
      }

      const data = await response.json();
      return data.keywords;
    } catch (error) {
      console.error("Error extracting English keywords:", error);
      throw error;
    }
  },

  /**
   * Extract keywords from Sinhala text
   * @param {string} text - The Sinhala text to extract keywords from
   * @param {number|null} maxKeywords - Optional maximum number of keywords to return
   * @returns {Promise<string[]>} Array of extracted Sinhala keywords
   */
  extractSinhalaKeywords: async (text, maxKeywords = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/extract_keywords_sinhala`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          max_keywords: maxKeywords,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract keywords");
      }

      const data = await response.json();
      return data.keywords;
    } catch (error) {
      console.error("Error extracting Sinhala keywords:", error);
      throw error;
    }
  },
};
