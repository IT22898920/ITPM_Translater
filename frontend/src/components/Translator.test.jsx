import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Translator from './Translator';
import { translateText } from '../utils/translate';

// Mock the translate utility
vi.mock('../utils/translate', () => ({
  translateText: vi.fn(),
}));

describe('Translator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      writable: true
    });
  });

  it('renders correctly', () => {
    render(<Translator />);
    expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/translation will appear here/i)).toBeInTheDocument();
  });

  it('handles language selection', async () => {
    render(<Translator />);
    
    // Source language selection
    const sourceSelect = screen.getByLabelText(/source language/i);
    await userEvent.click(sourceSelect);
    await userEvent.click(screen.getByText('French'));
    
    // Target language selection
    const targetSelect = screen.getByLabelText(/target language/i);
    await userEvent.click(targetSelect);
    await userEvent.click(screen.getByText('Spanish'));
    
    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });

  it('performs translation', async () => {
    translateText.mockResolvedValue('Hola mundo');
    
    render(<Translator />);
    
    await act(async () => {
      const inputText = screen.getByPlaceholderText(/enter text to translate/i);
      await userEvent.type(inputText, 'Hello world');
      
      const translateButton = screen.getByRole('button', { name: /translate now/i });
      await userEvent.click(translateButton);
    });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/translation will appear here/i)).toHaveValue('Hola mundo');
    });
    
    expect(translateText).toHaveBeenCalledWith('Hello world', 'en', 'si');
  });

  it('handles translation error', async () => {
    translateText.mockRejectedValue(new Error('Translation failed'));
    
    render(<Translator />);
    
    await act(async () => {
      const inputText = screen.getByPlaceholderText(/enter text to translate/i);
      await userEvent.type(inputText, 'Hello world');
      
      const translateButton = screen.getByRole('button', { name: /translate now/i });
      await userEvent.click(translateButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/translation failed/i)).toBeInTheDocument();
    });
  });

  it('swaps languages', async () => {
    render(<Translator />);
    
    await act(async () => {
      const inputText = screen.getByPlaceholderText(/enter text to translate/i);
      await userEvent.type(inputText, 'Hello');
      
      const swapButton = screen.getByRole('button', { name: /swap languages/i });
      await userEvent.click(swapButton);
    });
    
    expect(screen.getByPlaceholderText(/enter text to translate/i)).toHaveValue('');
  });

  it('copies text to clipboard', async () => {
    render(<Translator />);
    
    await act(async () => {
      const inputText = screen.getByPlaceholderText(/enter text to translate/i);
      await userEvent.type(inputText, 'Hello world');
      
      const copyButton = screen.getByRole('button', { name: /copy source text/i });
      await userEvent.click(copyButton);
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello world');
    await waitFor(() => {
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });
  });
});