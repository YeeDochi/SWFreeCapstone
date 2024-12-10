import sqlite3
from saveImageData import saveData, find_similar_prompts, find_similar_prompts_test
import time
import matplotlib.pyplot as plt
import os
import ImageMake

os.chdir(os.path.dirname(os.path.abspath(__file__)))
DATABASE = './DB/imageData.db'

# 테이블 생성 (앱 시작 시 한 번만 실행)
with sqlite3.connect(DATABASE) as conn:
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS users')
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, prompt TEXT, url TEXT)''')
    conn.commit()

execution_times_tfidf = []
execution_times_bert = []

# 데이터 저장
saveData(2, "asdfasdfa", "asdasdasd", conn)
for i in range(50):
    saveData(2, str(i+i*18+i*40), "asdasdasd", conn)


     # BERT 방식의 유사도 계산 및 시간 측정
    start_time = time.time()
    result_bert = find_similar_prompts(conn, str(i-i*18+i*40+(i-2)*11), threshold=0.5)
    end_time = time.time()
    elapsed_time_bert = end_time - start_time
    execution_times_bert.append(elapsed_time_bert)

    
    # TF-IDF 방식의 유사도 계산 및 시간 측정
    start_time = time.time()
    result_tfidf = find_similar_prompts_test(conn, str(i-i*18+i*40+(i-2)*11), threshold=0.5)
    end_time = time.time()
    elapsed_time_tfidf = end_time - start_time
    execution_times_tfidf.append(elapsed_time_tfidf)



# 이미지 생성 시간 측정
start_time = time.time()
image_url = ImageMake.generate_image("example prompt", "example_image_name")
end_time = time.time()
elapsed_time_image = end_time - start_time

# 결과 출력
print(f"TF-IDF 방식 평균 실행 시간: {sum(execution_times_tfidf) / len(execution_times_tfidf):.4f} 초")
print(f"BERT 방식 평균 실행 시간: {sum(execution_times_bert) / len(execution_times_bert):.4f} 초")
print(f"이미지 생성 실행 시간: {elapsed_time_image:.4f} 초")

# 실행 시간 그래프 출력
plt.rcParams['font.family'] = 'Malgun Gothic'

x_indices = range(1, len(execution_times_tfidf) + 1)

plt.plot(x_indices, execution_times_tfidf, label='TF-IDF', marker='o')
plt.plot(x_indices, execution_times_bert, label='BERT', marker='x')
plt.axhline(y=elapsed_time_image, color='r', linestyle='-', label='Image Generation')
plt.title("검색 및 이미지 생성 시간 변화 (데이터 수 증가에 따른)")
plt.xlabel("데이터 개수")
plt.ylabel("검색 및 생성 시간 (초)")
plt.legend()
plt.show()