const API_KEY = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

export async function translateText(text, sourceLang, targetLang) {
  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
      }),
    });

    if (!response.ok) {
      throw new Error('API Error');
    }

    const data = await response.json();
    
    if (!data.data?.translations?.[0]?.translatedText) {
      throw new Error('Invalid response format');
    }

    return data.data.translations[0].translatedText;
  } catch (error) {
    // Preserve network errors
    if (error.message === 'Network error' || error.name === 'TypeError') {
      throw new Error('Network error');
    }
    // Pass through specific error messages we want to preserve
    if (error.message === 'Invalid response format') {
      throw error;
    }
    // Otherwise wrap in API Error
    throw new Error('API Error');
  }
}