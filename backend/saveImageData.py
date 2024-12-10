import sqlite3
import openai
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from collections import Counter
from transformers import DistilBertTokenizer, DistilBertModel
import torch
from functools import lru_cache
from sklearn.feature_extraction.text import TfidfVectorizer

from ID import AIKEY
OPENAI_API_KEY = AIKEY
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
model = DistilBertModel.from_pretrained('distilbert-base-uncased')

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
        
@lru_cache(maxsize=1000) # 각 토큰들의 백터값을 미리 저장.
#각각의 데이터들은 계속 반복해서 비교되기 때문에 2개를 묶어서 하는 방식보다 개개인을 캐싱하는게 계산을 줄일수 있을것...
def get_bert_embedding_single(text):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

def get_bert_embedding(texts): #리스트로 토큰들을 받아와 각자 실행
    embeddings = [get_bert_embedding_single(text) for text in texts]
    return torch.tensor(embeddings)

# DistilBert 모델을 사용하여 문장의 임베딩 벡터를 비교하여 유사도 계산
def calculate_similarity_em(prompt1, prompt2):  # BERT 사용 유사도 분석
    embeddings = get_bert_embedding([prompt1, prompt2])
    embedding1, embedding2 = embeddings[0], embeddings[1]
    similarity = torch.cosine_similarity(embedding1.unsqueeze(0), embedding2.unsqueeze(0))
    return similarity.item()


def calculate_similarity(prompt1, prompt2): #api 사용 유사도 분석 - 느림 - 사용x

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

vectorizer = TfidfVectorizer()


@lru_cache(maxsize=None)  # 캐싱을 위한 데코레이터
def calculate_cosine_similarity(str1, str2): #단순 유사도 분석
    vectors = vectorizer.fit_transform([str1, str2]).toarray()
    return cosine_similarity(vectors)[0][1]


def find_similar_prompts(conn, target_string, threshold=0.9):
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    
    similarities = []
    
    # 각 프롬프트와 유사도 계산
    for row in rows:
        prompt_id = row[0]  # ID는 1번째
        prompt = row[2]     # 프롬프트는 3번째 
        similarity_score = calculate_similarity_em(target_string, prompt)
        print(similarity_score)
        
        # 임계값을 넘는 경우에만 저장
        if similarity_score >= threshold:
            similarities.append((prompt_id, similarity_score))
    
    # 유사도 내림차순으로 정렬
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # 상위 top_n개의 ID와 유사도 반환
    top_ids = [item[0] for item in similarities[:3]]
    
    return top_ids

def find_similar_prompts_test(conn, target_string, threshold=0.9):
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    
    similarities = []
    
    # 각 프롬프트와 유사도 계산
    for row in rows:
        prompt_id = row[0]  # ID는 1번째
        prompt = row[2]     # 프롬프트는 3번째 
        similarity_score = calculate_cosine_similarity(target_string, prompt)
        print(similarity_score)
        
        # 임계값을 넘는 경우에만 저장
        if similarity_score >= threshold:
            similarities.append((prompt_id, similarity_score))
    
    # 유사도 내림차순으로 정렬
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # 상위 top_n개의 ID와 유사도 반환
    top_ids = [item[0] for item in similarities[:3]]
    
    return top_ids

def get_url(conn,id): # url 리턴
    cursor = conn.cursor()
    cursor.execute("SELECT url FROM users WHERE id = ?", (id,))
    result = cursor.fetchone()  
    if result:
        return result[0]  
    return None  

def get_name(conn,id): #이름 리턴
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM users WHERE id = ?", (id,))
    result = cursor.fetchone()  
    if result:
        return result[0] 
    return None  

def get_name_by_url(conn,url): #url 로 이름 리턴
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM users WHERE url = ?", (url,))
    result = cursor.fetchone()  
    if result:
        return result[0] 
    return None  

def update_url(conn, name, new_url): # 기존 URL을 새로운 URL로 업데이트
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET url = ? WHERE name = ?", (new_url, name))
    conn.commit()

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