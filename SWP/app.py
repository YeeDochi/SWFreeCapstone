import logging
from flask import Flask, render_template, request, redirect, url_for, flash, g
from SmsSend import send, send_LMS
import ImageMake  # 이미지 생성 모듈 임포트
import sqlite3
from saveImageData import saveData, seeAll, find_similar_prompts, get_url, get_name, init_folder

app = Flask(__name__)
app.secret_key = 'supersecretkey'

DATABASE = './DB/imageData.db'

init_folder("./images")

# 데이터베이스 연결 함수
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
    return g.db

# 요청 종료 시 데이터베이스 연결 닫기
@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# 테이블 생성 (앱 시작 시 한 번만 실행)
with sqlite3.connect(DATABASE) as conn:
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS users')
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, prompt TEXT, url TEXT)''')
    conn.commit()

@app.route('/', methods=['GET', 'POST'])
def index():
    image_url = None
    phone_number = ''
    message = ''
    promptAdd = ''
    image_generated = False
    themaFlag = '1'
    image_name = '1'
    R_image_name ='0'

    if request.method == 'POST':
        phone_number = request.form.get('phone_number', '')
        message = request.form.get('message', '')
        promptAdd = request.form.get('promptAdd', '')
        themaFlag = request.form.get('themaFlag', '')
        image_name = request.form.get('image_name', '')
        R_image_name = request.form.get('R_image_name', '')
        print(themaFlag)

        if 'send_message_LMS' in request.form:
            message_key = send_LMS(message, phone_number)
            if message_key is not None:
                flash('Message sent successfully!', 'success')
            else:
                flash('Failed to send message', 'danger')
            return redirect(url_for('index'))

        if 'cartoon' in request.form:
            themaFlag = '1'
            flash('Cartoon Style Selected!', 'success')
        if 'thema1' in request.form:
            themaFlag = '2'
            flash('thema1 Style Selected!', 'success')
        if 'thema2' in request.form:
            themaFlag = '3'
            flash('thema2 Style Selected!', 'success')

        if 'generate_image' in request.form:
            prompt = message
            if prompt:
                conn = get_db()
                print(prompt)
                finish_prompt = ImageMake.generate_finalP(prompt, promptAdd)
                print(finish_prompt)
                result = find_similar_prompts(conn, finish_prompt)
                print(result)
                if(result == -1):
                    R_image_name = image_name
                    image_url = ImageMake.generate_image(finish_prompt+ImageMake.select_Thema(themaFlag),R_image_name)
                    saveData(image_name,finish_prompt, image_url, conn)
                    image_name = str(int(image_name) + 1)

                else:
                    image_url = get_url(conn,result)
                    R_image_name = get_name(conn,result)
                print(image_name,R_image_name)
                #seeAll(conn)
                image_generated = True
                flash('Image generated successfully!', 'success')

        if 'send_message' in request.form:
            print(R_image_name)
            message_key = send(message, phone_number, str(R_image_name))
            if message_key is not None:
                flash('Message sent successfully!', 'success')
            else:
                flash('Failed to send message', 'danger')
            return redirect(url_for('index'))

    return render_template('index.html', image_url=image_url,
                           phone_number=phone_number, message=message,
                           image_generated=image_generated, promptAdd=promptAdd,
                           themaFlag=themaFlag, image_name=image_name, R_image_name = R_image_name)

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app.run(debug=True, port=8080)
