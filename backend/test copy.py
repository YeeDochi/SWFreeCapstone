import sqlite3
from saveImageData import saveData, find_similar_prompts, find_similar_prompts_test,calculate_similarity_em , calculate_cosine_similarity
import time
import matplotlib.pyplot as plt
import os
import ImageMake
import torch
from transformers import DistilBertTokenizer, DistilBertModel
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# 테스트 문장
prompt1 = "I, am, looking, forward, to, learning, new, things, in, this, project"
prompt2 = "This, project, excites, me, because, it, offers, opportunities, to, gain, new, knowledge"

# BERT 방식의 유사도 계산
similarity_bert = calculate_similarity_em(prompt1, prompt2)
similarity_bert = round(similarity_bert, 3)
print(f"BERT 유사도: {similarity_bert}")

# TF-IDF 방식의 유사도 계산
similarity_tfidf = calculate_cosine_similarity(prompt1, prompt2)
similarity_tfidf = round(similarity_tfidf, 3)
print(f"TF-IDF 유사도: {similarity_tfidf}")

# 결과를 표로 정리
data = {
    "Model": ["BERT", "TF-IDF"],
    "Similarity": [similarity_bert, similarity_tfidf]
}
import pandas as pd
plt.rcParams['font.family'] = 'Malgun Gothic'

df = pd.DataFrame(data)
print(df)

# 표를 시각화
fig, ax = plt.subplots(figsize=(8, 3))
ax.axis('tight')
ax.axis('off')


# 표 생성
table = ax.table(cellText=df.values, colLabels=df.columns, cellLoc='center', loc='center')
table.auto_set_font_size(False)
table.set_fontsize(12)
table.scale(1.2, 1.2)

# 표 스타일 설정
for key, cell in table.get_celld().items():
    cell.set_edgecolor('black')
    cell.set_linewidth(1.5)
    if key[0] == 0:  # 헤더 행
        cell.set_facecolor('#40466e')
        cell.set_text_props(weight='bold', color='w')
    else:
        cell.set_facecolor('#f1f1f2')
text = f"prompt 1: {prompt1}                            \nprompt 2: {prompt2}"
fig.text(0.5, 0.8, text, ha='center', va='top', fontsize=11, wrap=True, weight='bold')

plt.title('BERT와 TF-IDF 방식의 유사도 비교', fontsize=16, weight='bold')
plt.show()