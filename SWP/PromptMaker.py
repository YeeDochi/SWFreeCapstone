import requests
import nltk
from nltk.tokenize import word_tokenize
from nltk import pos_tag
from googletrans import Translator
from ID import AIKEY

OPENAI_API_KEY = AIKEY

nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

def translate_korean_to_english(text):
    try:
        translator = Translator()
        translated = translator.translate(text, src='ko', dest='en')
        return translated.text
    except Exception as e:
        print("번역 오류:", e)
        return ""

def extract_nouns(text):
    words = word_tokenize(text)
    tagged_words = pos_tag(words)
    nouns = [word for word, pos in tagged_words if pos.startswith('NN')]
    return nouns

def prompt_maker(text):
    text = text.replace('.', '  ')
    english_text = translate_korean_to_english(text)
    if english_text:
        nouns = extract_nouns(english_text)
        sorted_nouns = sorted(nouns)
        return ', '.join(sorted_nouns)
    return ""


def translate_to_english(text): #너무 느리고 이상한 텍스트가 추가됨
    # OpenAI API를 통해 한국어를 영어로 번역
    prompt = f"Translate the following text to korean:\n\n{text}\n\nOnly provide the translated text, without any additional information."
    
    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-3.5-turbo',
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': 100
        }
    )

    if response.status_code == 200:
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    else:
        print(f"Request failed: {response.status_code}")
        return None
