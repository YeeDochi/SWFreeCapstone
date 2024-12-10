import base64
import logging
from flask import Flask, render_template, request, redirect, send_file, url_for, flash, g,jsonify , session
from PIL import Image
from SmsSend import send, send_LMS, send_message_LMS
import ImageMake  # 이미지 생성 모듈 임포트
import sqlite3
from saveImageData import saveData, seeAll, find_similar_prompts, get_url, get_name, init_folder,get_name_by_url,update_url
from flask_cors import CORS 
from Join import insert_user, check_username
from Login import login
from PromptMaker import translate_korean_to_english # 변경
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))


app = Flask(__name__)
app.secret_key = 'supersecretkey'
CORS(app, supports_credentials=True)

DATABASE = './DB/imageData.db'



init_folder("./images")
with sqlite3.connect(DATABASE) as conn:
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS users')
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, prompt TEXT, url TEXT)''')
    conn.commit()


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
 

@app.route('/api/img_changed', methods=['POST'])
def regenerate_image():
    data = request.get_json()
    image_data = data.get('new_image', '')
    name = data.get('url', '')

    conn = get_db()

    try:
        print("name: ", name)
        image_path = f"./images/{name}.jpeg"
        with open(image_path, 'wb') as f:
            f.write(base64.b64decode(image_data.split(',')[1]))

        # 이미지 열기 및 RGB 모드로 변환
        with Image.open(image_path) as img:
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(image_path, 'JPEG')

        update_url(conn, name, f"http://localhost:8080/api/get_image/{name}")
        seeAll(conn)
        return jsonify({"image_url": f"http://localhost:8080/api/get_image/{name}", "success": True})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e), "success": False}), 500


@app.route('/api/get_image/<name>', methods=['GET'])
def get_image(name):
    conn = get_db()
    try:
        
        if not name:
            return jsonify({"error": "Name not found for the provided URL", "success": False}), 404

        image_path = f"./images/{name}.jpeg"
        if not os.path.exists(image_path):
            return jsonify({"error": "Image not found", "success": False}), 404

        return send_file(image_path, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500
    finally:
        conn.close()

@app.route('/api/get_name_by_url', methods=['POST'])
def get_name_by_url_endpoint():
    data = request.get_json()
    url = data.get('url', '')

    conn = get_db()

    try:
        name = get_name_by_url(conn, url)
        if not name:
            return jsonify({"error": "Name not found for the provided URL", "success": False}), 404

        return jsonify({"name": name, "success": True})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e), "success": False}), 500
    finally:
        conn.close()



# 이미지 생성 API 엔드포인트
@app.route('/api/generate_image', methods=['POST'])
def generate_image():

    global image_name, R_image_name
    data = request.get_json()
    message = data.get('message', '')
    promptAdd = data.get('promptAdd', '')
    themaFlag = data.get('themaFlag', '')
    image_urls = []
    if message:  # 메시지가 있는 경우에만 처리
        
        conn = get_db()
        transMessage = translate_korean_to_english(message)
        print("translating message: ", transMessage)
        finish_prompt = ImageMake.generate_finalP(message, promptAdd)
        if(finish_prompt == "error"):
            return jsonify({"error": "Message is required", "success": False}), 400
        result = find_similar_prompts(conn, transMessage,0.8)


        if(result.__len__() == 0):
            R_image_name = image_name
            image_url = ImageMake.generate_image(finish_prompt+ImageMake.select_Thema(themaFlag),R_image_name)
            saveData(image_name,transMessage, image_url, conn)
            image_name = str(int(image_name) + 1)
            image_urls = [image_url]
        else:
            print(result)
            for row in result:
                image_urls.append(get_url(conn, row))
        print(image_name,R_image_name)


        return jsonify({"image_url": image_urls, "success": True})
    else:
        return jsonify({"error": "Message is required", "success": False}), 400
    
@app.route('/api/F_generate_image', methods=['POST']) #미리보기가 마음에 들지 않을때 강제적 재생성
def F_generate_image():

    global image_name, R_image_name
    data = request.get_json()
    message = data.get('message', '')
    promptAdd = data.get('promptAdd', '')
    themaFlag = data.get('themaFlag', '')
    
    if message:  # 메시지가 있는 경우에만 처리
        
        conn = get_db()
        transMessage = translate_korean_to_english(message)
        print("translating message: ", transMessage)
        finish_prompt = ImageMake.generate_finalP(message, promptAdd)
       
        R_image_name = image_name
        image_url = ImageMake.generate_image(finish_prompt+ImageMake.select_Thema(themaFlag),R_image_name)
        saveData(image_name, transMessage , image_url, conn)
        image_name = str(int(image_name) + 1)
        print(image_name,R_image_name)

        image_urls = [
            image_url
        ]

        return jsonify({"image_url": image_urls, "success": True})
    else:
        return jsonify({"error": "Message is required", "success": False}), 400



# LMS 메시지 전송 API 엔드포인트
@app.route('/api/send_message_LMS', methods=['POST'])
def send_message_LMS():
    data = request.get_json()
    phoneNumber = data.get('phoneNumber', '')
    message = data.get('message', '')

    message_key = send_LMS(message, phoneNumber)
    if message_key is not None:
        return jsonify({"success": True, "message_key": message_key})
    else:
        return jsonify({"success": False, "error": "Failed to send message"}), 500
    

#이미지 메세지
@app.route('/api/send_message_img', methods=['POST'])
def send_message_img():
    data = request.get_json()
    message = data.get('message')
    phoneNumbers = data.get('phoneNumber')  # 수정: 복수 형태로 변수 이름 유지
    imageName = data.get('imageName')  # 이미지 이름을 받음

    # 입력 데이터 검증
    if not all([message, phoneNumbers, imageName]):
        return jsonify({"error": "Missing required fields"}), 400

    if not isinstance(phoneNumbers, list) or not phoneNumbers:
        return jsonify({"error": "phoneNumber must be a non-empty list"}), 400

    try:
        message_keys = []  # 각 메시지 전송 결과를 저장
        for phoneNumber in phoneNumbers:
            print(f"Sending message to: {phoneNumber}")
            message_key = send(message, phoneNumber, imageName)
            if message_key:
                message_keys.append({"phoneNumber": phoneNumber, "messageKey": message_key})
            else:
                print(f"Failed to send message to {phoneNumber}")

        if message_keys:
            return jsonify({"status": "success", "results": message_keys})
        else:
            return jsonify({"status": "fail", "error": "All messages failed"}), 500
    except Exception as e:
        print(f"Error during message sending: {e}")
        return jsonify({"status": "fail", "error": str(e)}), 500





# 아이디 중복 체크 엔드포인트
@app.route('/api/check-username', methods=['POST'])
def api_check_username():
    data = request.get_json()
    user_id = data.get('user_id')
    response = check_username(user_id)
    return jsonify(response)

# 회원가입 엔드포인트
@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    user_id = data.get('user_id')
    password = data.get('password')
    username = data.get('username')
    user_number = data.get('phoneNumber')
    co_number = data.get('businessNumber')

    response = insert_user(user_id, username, password, user_number, co_number)
    return jsonify(response)


#로그인
@app.route('/api/api_login', methods=['POST'])
def api_login():
    data = request.get_json()
    user_id = data.get('username')
    password = data.get('password')

    response = login(user_id, password)
    if response['status'] == 'success':
        session['user_id'] = response['user_id']  # 세션 설정
    return jsonify(response)

image_name = '1'
R_image_name ='0'

@app.route('/api/user-info', methods=['GET'])
def user_info():
    if 'user_id' in session:
        user_id = session['user_id']

        # 데이터베이스에서 사용자 이름 조회
        conn = sqlite3.connect('./DB/pickmeimage.db')
        cursor = conn.cursor()
        cursor.execute("SELECT user_name FROM Users WHERE user_id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()

        if user:
            username = user[0]
            return jsonify({
                'user_id': user_id,
                'username': username
            })

    return jsonify({'message': '로그인이 필요합니다.'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        # 세션에서 사용자 정보 삭제
        session.pop('user_id', None)
        
        # 로그아웃 성공 응답
        return jsonify({'status': 'success', 'message': '로그아웃 되었습니다.'}), 200
    except Exception as e:
        # 에러 처리
        print(f"로그아웃 중 오류 발생: {e}")
        return jsonify({'status': 'fail', 'message': '로그아웃 중 오류가 발생했습니다.'}), 500

def get_db_user():
    conn = sqlite3.connect('./DB/pickmeimage.db')
    conn.row_factory = sqlite3.Row  # 결과를 딕셔너리 형태로 반환
    return conn

# 그룹 목록 가져오기
@app.route('/api/groups', methods=['GET'])
def get_groups():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'fail', 'message': '로그인이 필요합니다.'}), 401
    
    try:
        conn = get_db_user()
        cursor = conn.cursor()
        cursor.execute("SELECT group_id, group_name FROM Groups WHERE user_id = ?", (user_id,))
        groups = cursor.fetchall()
        conn.close()

        return jsonify({'status': 'success', 'groups': [dict(row) for row in groups]})
    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 500

# 그룹 추가
@app.route('/api/groups', methods=['POST'])
def add_group():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'fail', 'message': '로그인이 필요합니다.'}), 401

    data = request.get_json()
    group_name = data.get('group_name')

    if not group_name:
        return jsonify({'status': 'fail', 'message': '그룹 이름이 필요합니다.'}), 400

    try:
        conn = get_db_user()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Groups (group_name, user_id) VALUES (?, ?)", (group_name, user_id))
        conn.commit()
        conn.close()

        return jsonify({'status': 'success', 'message': '그룹이 추가되었습니다.'}), 201
    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 500

# 특정 그룹의 연락처 가져오기
@app.route('/api/groups/<int:group_id>/contacts', methods=['GET'])
def get_contacts(group_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'fail', 'message': '로그인이 필요합니다.'}), 401

    try:
        conn = get_db_user()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT contact_id, name, phone 
            FROM Contacts 
            WHERE group_id = ? AND user_id = ?
        """, (group_id, user_id))
        contacts = cursor.fetchall()
        conn.close()

        return jsonify({'status': 'success', 'contacts': [dict(row) for row in contacts]})
    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 500

# 연락처 추가
@app.route('/api/groups/<int:group_id>/contacts', methods=['POST'])
def add_contact(group_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'fail', 'message': '로그인이 필요합니다.'}), 401

    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')

    if not name or not phone:
        return jsonify({'status': 'fail', 'message': '이름과 전화번호가 필요합니다.'}), 400

    try:
        conn = get_db_user()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Contacts (name, phone, group_id, user_id) 
            VALUES (?, ?, ?, ?)
        """, (name, phone, group_id, user_id))
        conn.commit()
        conn.close()

        return jsonify({'status': 'success', 'message': '연락처가 추가되었습니다.'}), 201
    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 500

# 그룹 삭제
@app.route('/api/groups/<int:group_id>', methods=['DELETE'])
def delete_group(group_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'fail', 'message': '로그인이 필요합니다.'}), 401

    try:
        conn = get_db_user()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Groups WHERE group_id = ? AND user_id = ?", (group_id, user_id))
        cursor.execute("DELETE FROM Contacts WHERE group_id = ?", (group_id,))
        conn.commit()
        conn.close()

        return jsonify({'status': 'success', 'message': '그룹이 삭제되었습니다.'})
    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 500

# 연락처 삭제
@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'status': 'fail', 'message': '로그인이 필요합니다.'}), 401

    try:
        conn = get_db_user()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Contacts WHERE contact_id = ? AND user_id = ?", (contact_id, user_id))
        conn.commit()
        conn.close()

        return jsonify({'status': 'success', 'message': '연락처가 삭제되었습니다.'})
    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 500
    



if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app.run(debug=True, port=8080)
