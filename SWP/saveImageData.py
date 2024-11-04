from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from collections import Counter

from functools import lru_cache
from sklearn.feature_extraction.text import TfidfVectorizer

import openai
from ID import AIKEY
OPENAI_API_KEY = AIKEY

def saveData(name, prompt, url, conn):
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (name, prompt, url) VALUES (?, ?, ?)", (name, prompt, url))
    conn.commit()

# 데이터 조회
def seeAll(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    for row in rows:
        print(row)

vectorizer = TfidfVectorizer()


@lru_cache(maxsize=None)  # 캐싱을 위한 데코레이터
def calculate_cosine_similarity(str1, str2):
    vectors = vectorizer.fit_transform([str1, str2]).toarray()
    print(vectors)
    return cosine_similarity(vectors)[0][1]


def find_similar_prompts(conn, target_string, threshold=0.42):
   
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    
    most_similar_id = -1
    highest_similarity = -1  
    
    # 각 프롬프트와 유사도 계산
    for row in rows:
        prompt_id = row[0]  # ID는 1번째
        prompt = row[2]     # 프롬프트는 3번째 
        similarity_score = calculate_cosine_similarity(target_string, prompt)
        print(similarity_score)
    
        if similarity_score > highest_similarity:
            highest_similarity = similarity_score
            most_similar_id = prompt_id
    
    if highest_similarity < threshold:
        most_similar_id = -1
    
    return most_similar_id

def get_url(conn,id): # url 리턴
    cursor = conn.cursor()
    cursor.execute("SELECT url FROM users WHERE id = ?", (id,))
    result = cursor.fetchone()  
    if result:
        return result[0]  
    return None  

def get_name(conn,id): #id 리턴
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM users WHERE id = ?", (id,))
    result = cursor.fetchone()  
    if result:
        return result[0] 
    return None  

import os

def init_folder(folder_path):
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if filename.lower().endswith('.jpeg') or filename.lower().endswith('.jpg'):
            try:
                os.remove(file_path)  
                print(f'Deleted: {file_path}')
            except Exception as e:
                print(f'Error deleting {file_path}: {e}')

                
def calculate_similarity(prompt1, prompt2): #api 사용 유사도 분석 - 느림

    response = openai.Embedding.create(
        input=[prompt1, prompt2],
        model="text-embedding-ada-002" 
    )
    
    # 두 벡터 간의 코사인 유사도 계산
    vector1 = response['data'][0]['embedding']
    vector2 = response['data'][1]['embedding']
    
    # 코사인 유사도 계산
    similarity = sum(a*b for a, b in zip(vector1, vector2)) / (sum(a*a for a in vector1) ** 0.5 * sum(b*b for b in vector2) ** 0.5)
    
    return similarity