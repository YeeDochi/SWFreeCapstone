import requests
import nltk
from nltk.tokenize import word_tokenize
from nltk import pos_tag
from googletrans import Translator
from ID import AIKEY
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

OPENAI_API_KEY = AIKEY

nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

def translate_korean_to_english(text):
    translator = Translator()
    try:
        translated = translator.translate(text, src='ko', dest='en')
        if translated and translated.text:
            return translated.text
        else:
            print("번역 오류: 번역된 텍스트가 없습니다.")
            return ""
    except Exception as e:
        print("번역 오류:", e)
        return ""

def extract_important_words(text):
    if not text.strip():
        print("입력된 텍스트가 비어 있습니다.")
        return "error"
    
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform([text])
    except ValueError as e:
        print("TF-IDF 변환 오류:", e)
        return "error"
    
    feature_names = vectorizer.get_feature_names_out()
    scores = tfidf_matrix.toarray()[0]
    important_words = [feature_names[i] for i in np.argsort(scores)[-10:]]  # 상위 10개 단어 추출
    return important_words

def prompt_maker(text):
    
    english_text = translate_korean_to_english(text)
    if english_text:
        important_words = extract_important_words(english_text)
        result = ', '.join(important_words)
        print("Extracting important words from text:", result)
        if (result == "e, r, r, o, r"):
            return "error"
        return result
    else:
        return ""

def translate_to_english(text): # 너무 느리고 이상한 텍스트가 추가됨
    # OpenAI API를 통해 한국어를 영어로 번역
    prompt = f"Translate the following text to korean:\n\n{text}\n\nOnly provide the translated text, without any additional information."
    
    try:
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
    except Exception as e:
        print(f"번역 요청 오류: {e}")
        return None
