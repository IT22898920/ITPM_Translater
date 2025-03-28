import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateText } from './translate';

describe('translateText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully translate text', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              translations: [
                {
                  translatedText: 'Bonjour le monde',
                },
              ],
            },
          }),
      })
    );

    const result = await translateText('Hello world', 'en', 'fr');
    expect(result).toBe('Bonjour le monde');

    expect(fetch).toHaveBeenCalledWith(
      'https://translation.googleapis.com/language/translate/v2?key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: 'Hello world',
          source: 'en',
          target: 'fr',
        }),
      }
    );
  });

  it('should handle API errors', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );

    await expect(translateText('Hello', 'en', 'fr')).rejects.toThrow('API Error');
  });

  it('should handle invalid response format', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' }),
      })
    );

    await expect(translateText('Hello', 'en', 'fr')).rejects.toThrow('Invalid response format');
  });

  it('should handle network errors', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    await expect(translateText('Hello', 'en', 'fr')).rejects.toThrow('Network error');
  });
});