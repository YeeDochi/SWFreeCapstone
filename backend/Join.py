import sqlite3

# 중복 확인 함수
def check_username(user_id):
    try:
        conn = sqlite3.connect('./DB/pickmeimage.db')
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM Users WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()
        conn.close()

        if result:
            return {'status': 'fail', 'message': '이미 사용 중인 아이디입니다.'}
        else:
            return {'status': 'success', 'message': '사용 가능한 아이디입니다.'}
    except Exception as e:
        print(f"오류 발생: {e}")  # 오류 내용 출력
        return {'status': 'fail', 'message': f'중복 확인오류가 발생했습니다: {str(e)}'}

# 회원가입 함수
def insert_user(user_id, username, password, user_number, co_number):
    try:
        conn = sqlite3.connect('./DB/pickmeimage.db')
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Users (user_id, user_name, password, user_number, company_number)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, username, password, user_number, co_number))
        conn.commit()
        conn.close()
        return {'status': 'success', 'message': '회원가입이 완료되었습니다.'}
    except sqlite3.IntegrityError:
        return {'status': 'fail', 'message': '중복된 아이디가 있습니다.'}
    except Exception as e:
        return {'status': 'fail', 'message': '회원가입 중 오류가 발생했습니다.'}
