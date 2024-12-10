from flask import session
import sqlite3


def login(user_id, password):
    try:
        conn = sqlite3.connect('./DB/pickmeimage.db')
        cursor = conn.cursor()

        # user_id와 password로 사용자 확인
        cursor.execute("SELECT user_id, password FROM Users WHERE user_id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()

        if user:
            user_checkid, user_password = user
            if user_password == password:  # 비밀번호 비교
                return {'status': 'success', 'user_id': user_checkid, 'message': '로그인 성공!'}
            else:
                return {'status': 'fail', 'message': '비밀번호가 일치하지 않습니다.'}
        else:
            return {'status': 'fail', 'message': '아이디가 존재하지 않습니다.'}
    except Exception as e:
        print(f"오류 발생: {e}")
        return {'status': 'fail', 'message': f'로그인 중 오류가 발생했습니다: {str(e)}'}