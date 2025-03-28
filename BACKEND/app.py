from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.tokenize import word_tokenize
from nltk.probability import FreqDist
from nltk import pos_tag
import warnings
import os
import ssl
import logging
import urllib.request

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Suppress any NLTK-related warnings
warnings.filterwarnings('ignore')

# Fix SSL certificate verification for NLTK downloads
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Create a custom NLTK data path
nltk_data_path = os.path.join(os.path.expanduser('~'), 'nltk_data')
os.makedirs(nltk_data_path, exist_ok=True)

def setup_punkt_tab():
    """Create necessary punkt_tab resources manually if they don't exist."""
    try:
        punkt_tab_dir = os.path.join(nltk_data_path, 'tokenizers', 'punkt_tab', 'english')
        os.makedirs(punkt_tab_dir, exist_ok=True)
        
        # Check for collocations.tab file
        collocations_file = os.path.join(punkt_tab_dir, 'collocations.tab')
        if not os.path.exists(collocations_file):
            # Create an empty collocations.tab file
            with open(collocations_file, 'w') as f:
                f.write('')
            logger.info("Created empty collocations.tab file")
        
        # Create empty punkt.data file if it doesn't exist
        punkt_data_file = os.path.join(punkt_tab_dir, 'punkt.data')
        if not os.path.exists(punkt_data_file):
            with open(punkt_data_file, 'w') as f:
                f.write('')
            logger.info("Created empty punkt.data file")
            
        return True
    except Exception as e:
        logger.error(f"Error setting up punkt_tab resources: {str(e)}")
        return False

# Add punkt_tab to the resources
try:
    # Create the punkt_tab directory structure if it doesn't exist
    punkt_tab_dir = os.path.join(nltk_data_path, 'tokenizers', 'punkt_tab', 'english')
    os.makedirs(punkt_tab_dir, exist_ok=True)
    
    # Create an empty file to satisfy the punkt_tab requirement
    with open(os.path.join(punkt_tab_dir, 'punkt.data'), 'w') as f:
        f.write('')
    
    # Create collocations.tab file
    with open(os.path.join(punkt_tab_dir, 'collocations.tab'), 'w') as f:
        f.write('')
    
    logger.info("Created punkt_tab resource manually")
except Exception as e:
    logger.error(f"Error creating punkt_tab resource: {str(e)}")

# Download all required NLTK resources
nltk_resources = [
    'punkt',
    'averaged_perceptron_tagger',
    'wordnet',
    'stopwords',
    'universal_tagset'
]

for resource in nltk_resources:
    try:
        nltk.download(resource, download_dir=nltk_data_path, quiet=False)
        logger.info(f"Downloaded NLTK resource: {resource}")
    except Exception as e:
        logger.error(f"Error downloading NLTK resource {resource}: {str(e)}")

def install_googletrans():
    """Install googletrans package if not available."""
    try:
        import googletrans
        logger.info("Googletrans package is already installed")
        return True
    except ImportError:
        try:
            logger.warning("Googletrans package not found. Attempting to install...")
            
            # Set up SSL context for downloads
            ssl._create_default_https_context = ssl._create_unverified_context
            
            # Try pip install using subprocess
            import subprocess
            subprocess.check_call(["pip", "install", "googletrans==4.0.0-rc1"])
            
            # Verify installation
            import googletrans
            logger.info("Successfully installed googletrans package")
            return True
        except Exception as e:
            logger.error(f"Failed to install googletrans: {str(e)}")
            return False

# Initialize Flask app
app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})  # For development

def translator(t):
    """Translate any given text (string) into English using Google Translate."""
    try:
        from googletrans import Translator
        # Try using multiple service URLs in case one fails
        try:
            translator = Translator(service_urls=['translate.google.com'])
        except:
            try:
                translator = Translator()
            except:
                # Last resort fallback
                class FallbackTranslator:
                    def translate(self, text, **kwargs):
                        class TranslationResult:
                            def __init__(self, text):
                                self.text = text
                        return TranslationResult(text)
                translator = FallbackTranslator()
        result = translator.translate(t, dest='en')
        logger.info(f"Translation successful: '{t[:100]}...' → '{result.text[:100]}...'")  # Log only first 100 chars
        return result.text
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        # Return original text if translation fails
        return t

def sinhalTranslator(words):
    """Translate a list of English words into Sinhala."""
    try:
        from googletrans import Translator
        translator = Translator(service_urls=['translate.google.com'])
        sinhala_words = []
        
        for word in words:
            try:
                translated_word = translator.translate(word, src='en', dest='si').text
                logger.info(f"Translated to Sinhala: '{word}' → '{translated_word}'")
                sinhala_words.append(translated_word)
            except Exception as e:
                logger.warning(f"Failed to translate '{word}': {str(e)}")
                sinhala_words.append(word)  # Fallback to original word
                
        return sinhala_words
    except Exception as e:
        logger.error(f"Sinhala translation error: {str(e)}")
        return words  # Return original words if translation fails

def keywordsExtractorEnglish(text, max_keywords=None):
    """
    Extract English nouns from the input text.
    
    Parameters:
    text (str): The input text to extract keywords from
    max_keywords (int, optional): Maximum number of keywords to return. If None, returns all keywords.
    
    Returns:
    list: List of extracted keywords
    """
    try:
        # First try using NLTK's word_tokenize
        try:
            # Make sure punkt_tab resources are available
            setup_punkt_tab()
            tokens = word_tokenize(text)
        except Exception as tokenize_error:
            # Fallback to simple space-based tokenization if NLTK tokenizer fails
            logger.warning(f"NLTK tokenization failed: {str(tokenize_error)}. Using fallback tokenizer.")
            tokens = text.split()
        
        try:
            # First try standard POS tagging
            tagged_tokens = pos_tag(tokens)
            # Extract nouns (words tagged with NN, NNS, NNP, NNPS)
            nouns = [word.lower() for word, pos in tagged_tokens if pos.startswith('NN')]
            
            # If no nouns found, try universal tagset
            if not nouns:
                try:
                    from nltk.tag import pos_tag_sents
                    from nltk.tag.util import untag
                    universal_tagged = pos_tag(tokens, tagset='universal')
                    nouns = [word.lower() for word, pos in universal_tagged if pos == 'NOUN']
                except:
                    # Fallback if universal tagset fails
                    nouns = [word.lower() for word in tokens if len(word) > 3]
        except Exception as pos_error:
            # Fallback if POS tagging fails: treat all words as potential keywords
            logger.warning(f"POS tagging failed: {str(pos_error)}. Using all words as potential keywords.")
            # Remove common English stop words
            from nltk.corpus import stopwords
            try:
                stop_words = set(stopwords.words('english'))
                nouns = [word.lower() for word in tokens if len(word) > 3 and word.lower() not in stop_words]
            except:
                # If stopwords fail, just use all words with length > 3
                nouns = [word.lower() for word in tokens if len(word) > 3]
        
        # Calculate word frequencies
        freq_dist = FreqDist(nouns)
        
        # Get keywords based on max_keywords parameter
        if max_keywords is not None:
            top_keywords = freq_dist.most_common(max_keywords)
        else:
            # Get all keywords with their frequencies
            top_keywords = freq_dist.most_common()
            
        logger.info(f"Extracted {len(top_keywords)} English keywords")
        
        return [keyword[0] for keyword in top_keywords]
    except Exception as e:
        logger.error(f"Error extracting English keywords: {str(e)}")
        # Last resort fallback - return words from the text
        try:
            words = text.split()
            # Return words with length > 3, limited by max_keywords if specified
            filtered_words = [word.lower() for word in words if len(word) > 3]
            if max_keywords is not None:
                return filtered_words[:max_keywords]
            return filtered_words
        except:
            return []

def keywordExtractorFromSinhala(text, max_keywords=None):
    """
    1. Translate Sinhala text to English
    2. Extract English nouns
    3. Translate top English nouns back to Sinhala
    
    Parameters:
    text (str): The Sinhala text to extract keywords from
    max_keywords (int, optional): Maximum number of keywords to return. If None, returns all keywords.
    
    Returns:
    list: List of Sinhala keywords
    """
    try:
        # First, translate from Sinhala to English
        english_text = translator(text)
        logger.info(f"Translated to English: '{english_text[:100]}...'")  # Log only first 100 chars
        
        # Extract English keywords
        english_keywords = keywordsExtractorEnglish(english_text, max_keywords)
        logger.info(f"Extracted {len(english_keywords)} keywords")
        
        # Convert back to Sinhala
        sinhala_keywords = sinhalTranslator(english_keywords)
        logger.info(f"Final Sinhala keywords: {sinhala_keywords}")
        
        return sinhala_keywords
    except Exception as e:
        logger.error(f"Error in Sinhala keyword extraction: {str(e)}")
        return []

@app.route('/extract_keywords_sinhala', methods=['POST'])
def extract_keywords_sinhala():
    """
    POST JSON: {"text": "සිංහල වාක්‍යයක්", "max_keywords": 10}
    Returns: {"keywords": [...]}
    """
    if request.method == 'POST':
        try:
            data = request.json
            if not data:
                logger.warning("Invalid JSON data received")
                return jsonify({'error': 'Invalid JSON data'}), 400
            
            text = data.get('text', '')
            if not text:
                logger.warning("Text not provided in request")
                return jsonify({'error': 'Text not provided in the request body'}), 400
            
            # Get max_keywords parameter if provided, otherwise use None to get all keywords
            max_keywords = data.get('max_keywords', None)
            logger.info(f"Processing Sinhala text with max_keywords={max_keywords}")
            
            keywords = keywordExtractorFromSinhala(text, max_keywords)
            
            return jsonify({'keywords': keywords})
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            return jsonify({'error': str(e)}), 500

@app.route('/extract_keywords', methods=['POST'])
def extract_keywords_english():
    """
    POST JSON: {"text": "This is an example sentence.", "max_keywords": 10}
    Returns: {"keywords": [...]}
    """
    if request.method == 'POST':
        try:
            data = request.json
            if not data:
                logger.warning("Invalid JSON data received")
                return jsonify({'error': 'Invalid JSON data'}), 400
            
            text = data.get('text', '')
            if not text:
                logger.warning("Text not provided in request")
                return jsonify({'error': 'Text not provided in the request body'}), 400
            
            # Get max_keywords parameter if provided, otherwise use None to get all keywords
            max_keywords = data.get('max_keywords', None)
            logger.info(f"Processing English text with max_keywords={max_keywords}")
            
            keywords = keywordsExtractorEnglish(text, max_keywords)
            
            return jsonify({'keywords': keywords})
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    """Simple home endpoint to verify the API is running."""
    return jsonify({
        'status': 'API is running',
        'endpoints': {
            '/extract_keywords': 'Extract keywords from English text (POST with {"text": "...", "max_keywords": optional_number})',
            '/extract_keywords_sinhala': 'Extract keywords from Sinhala text (POST with {"text": "...", "max_keywords": optional_number})'
        }
    })

if __name__ == '__main__':
    # Set up required resources
    setup_punkt_tab()
    install_googletrans()
    
    # Check if NLTK resources are properly loaded
    logger.info("Verifying NLTK resources...")
    try:
        # Test tokenization
        test_text = "This is a test sentence."
        tokens = word_tokenize(test_text)
        logger.info(f"Tokenization test: {tokens}")
        
        # Test POS tagging
        tags = pos_tag(tokens)
        logger.info(f"POS tagging test: {tags}")
        
        logger.info("NLTK resources verified successfully")
    except Exception as e:
        logger.warning(f"NLTK verification failed: {str(e)}. The app will use fallback methods.")

    # Set host to 0.0.0.0 to make it accessible from other devices on the network
    app.run(host='0.0.0.0', port=5000, debug=True)