import axios from 'axios';

export async function checkGrammar(text, language) {
  try {
    if (language === 'si') {
      // Use LanguageTool API for Sinhala with specific configuration
      const params = new URLSearchParams();
      params.append('text', text);
      params.append('language', 'si');
      params.append('enabledOnly', 'false');
      // Add specific rules for Sinhala
      params.append('disabledRules', 'WHITESPACE_RULE,UPPERCASE_SENTENCE_START');
      
      const response = await axios.post(
        'https://api.languagetool.org/v2/check',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 15000 // Increased timeout for better reliability
        }
      );

      if (!response.data || !response.data.matches) {
        throw new Error('Invalid response format');
      }

      return response.data.matches.map(match => ({
        message: match.message || 'ව්‍යාකරණ දෝෂයකි',
        offset: match.offset || 0,
        length: match.length || 0,
        replacements: (match.replacements || []).map(replacement => ({
          value: replacement.value
        })),
        context: {
          text: match.context?.text || text,
          offset: match.context?.offset || 0,
          length: match.context?.length || 0
        },
        rule: {
          id: match.rule?.id || 'grammar-error',
          description: match.rule?.description || 'ව්‍යාකරණ දෝෂයකි',
          category: match.rule?.category || 'grammar'
        }
      }));
    } else {
      // Use LanguageTool API for other languages
      const params = new URLSearchParams();
      params.append('text', text);
      params.append('language', language === 'en' ? 'en-US' : language);
      params.append('enabledOnly', 'false');

      const response = await axios.post(
        'https://api.languagetool.org/v2/check',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 15000
        }
      );

      if (!response.data || !response.data.matches) {
        throw new Error('Invalid response format');
      }

      return response.data.matches.map(match => ({
        message: match.message,
        offset: match.offset,
        length: match.length,
        replacements: match.replacements,
        context: match.context,
        rule: match.rule
      }));
    }
  } catch (error) {
    console.error('Grammar check error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error(language === 'si' ? 
        'සේවාව ප්‍රතිචාර නොදක්වයි. කරුණාකර පසුව නැවත උත්සාහ කරන්න.' : 
        'Service timeout. Please try again later.');
    }
    
    if (error.response?.status === 404) {
      throw new Error(language === 'si' ? 
        'ව්‍යාකරණ පරීක්ෂණ සේවාව දැනට නොමැත.' : 
        'Grammar checking service is currently unavailable');
    }
    
    if (error.response?.status === 429) {
      throw new Error(language === 'si' ? 
        'ඉල්ලීම් සීමාව ඉක්මවා ඇත. කරුණාකර පසුව නැවත උත්සාහ කරන්න.' : 
        'Too many requests. Please try again later.');
    }

    if (error.message === 'Network Error') {
      throw new Error(language === 'si' ? 
        'ජාල සම්බන්ධතා දෝෂයකි. කරුණාකර ඔබගේ අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.' : 
        'Network error. Please check your internet connection and try again.');
    }

    throw new Error(language === 'si' ? 
      'ව්‍යාකරණ පරීක්ෂාව අසාර්ථක විය.' : 
      'Grammar check failed');
  }
}