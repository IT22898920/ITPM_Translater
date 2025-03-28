import axios from 'axios';

export async function synthesizeSpeech(text, lang) {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        input: { text },
        voice: {
          languageCode: lang === 'si' ? 'si-LK' : lang,
          name: lang === 'si' ? 'si-LK-Standard-A' : undefined,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: lang === 'si' ? 0 : undefined,
          speakingRate: lang === 'si' ? 0.9 : 1,
        },
      }
    );

    if (!response.data || !response.data.audioContent) {
      throw new Error('Invalid response format');
    }

    // Convert base64 to audio
    const audioContent = response.data.audioContent;
    const audioBlob = new Blob(
      [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
      { type: 'audio/mp3' }
    );
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new Error(
      lang === 'si'
        ? 'කථන සංස්ලේෂණය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.'
        : 'Text-to-speech synthesis failed. Please try again.'
    );
  }
}