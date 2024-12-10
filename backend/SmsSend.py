import logging
import requests
import base64
import os
import io
from requests.auth import HTTPBasicAuth
from ID import USER_NAME, TOKEN
from PIL import Image
os.chdir(os.path.dirname(os.path.abspath(__file__)))


API_URL = "https://message.ppurio.com"

def make_request(url, auth=None, payload=None, headers=None):
    response = None
    try:
        response = requests.post(url, headers=headers, json=payload, auth=auth, timeout=5)
        response.raise_for_status()
    except requests.exceptions.RequestException:
        logging.error(f"An error occurred: {response.json()}")

    return response.json()

# 엑세스 토큰 발급 (한 번 발급된 토큰은 24시간동안 유효합니다.)
def get_access_token():
    # request 데이터 세팅(url, headers)
    url = f"{API_URL}/v1/token"
    auth = HTTPBasicAuth(USER_NAME, TOKEN)

    # response 데이터 생성
    response_data = make_request(url, auth)

    # access_token 반환
    return response_data.get("token") if response_data else None


# 메시지 발송(MMS)
def send_message(access_token, ImageUrl,size,message_words,number):
    # request 데이터 세팅(url, headers, payload)
    url = f"{API_URL}/v1/message"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "account": f"{USER_NAME}",      # 뿌리오 계정
        "messageType": "MMS",       # SMS(단문) / LMS(장문) / MMS(포토)
        "content": f"{message_words}",  # 메시지 내용

        "from": "01046183746",      # 발신번호(숫자만)
        "duplicateFlag": "N",       # 수신번호 중복 허용 여부(Y:허용 / N:제거)
        "targetCount": 1,           # 수신자수
        "refKey": "1",
        #"sendTime": f"{SEND_TIME}", # 예약일자 (즉시발송은 해당 필드를 삭제)
        "targets": [                # 수신자 및 변수(치환문자) 정보
            {
                "to": number, # 수신자 번호(숫자만)
            }
        ],    
        "files": [{"name": "test.jpeg","size": size,"data": f"{ImageUrl}"}]
    }

    # response 데이터 생성
    response_data = make_request(url, None, payload, headers)
    logging.info(f"Send message response: {response_data}")

    # messageKey 반환
    return response_data.get("messageKey") if response_data else None

# 메시지 발송(MMS)
def send_message_LMS(access_token,message_words,number):
    # request 데이터 세팅(url, headers, payload)
    url = f"{API_URL}/v1/message"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "account": f"{USER_NAME}",      # 뿌리오 계정
        "messageType": "LMS",       # SMS(단문) / LMS(장문) / MMS(포토)
        "content": f"{message_words}",  # 메시지 내용

        "from": "01046183746",      # 발신번호(숫자만)
        "duplicateFlag": "N",       # 수신번호 중복 허용 여부(Y:허용 / N:제거)
        "targetCount": 1,           # 수신자수
        "refKey": "1",
        #"sendTime": f"{SEND_TIME}", # 예약일자 (즉시발송은 해당 필드를 삭제)
        "targets": [                # 수신자 및 변수(치환문자) 정보
            {
                "to": f"{number}", # 수신자 번호(숫자만)
            }
        ],    
    }

    # response 데이터 생성
    response_data = make_request(url, None, payload, headers)
    logging.info(f"Send message response: {response_data}")

    # messageKey 반환
    return response_data.get("messageKey") if response_data else None


# 예약발송 취소
def cancel_reservation(access_token, message_key):
    # request 데이터 세팅(url, headers, payload)
    url = f"{API_URL}/v1/cancel"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "account": f"{USER_NAME}",      # 뿌리오 계정
        "messageKey": f"{message_key}"  # 고유 메시지 키
    }

    # response 데이터 생성
    response_data = make_request(url, None, payload, headers)
    logging.info(f"Cancel response: {response_data}")

    # cancel_code 반환
    return response_data.get("code") if response_data else None

def calculate_file_size_from_base64(base64_data):
    # Base64 데이터의 실제 크기를 계산
    padding = base64_data.count('=')
    base64_length = len(base64_data)
    actual_size = (base64_length * 3) // 4 - padding
    return actual_size

def send(prompt, phone_number,name):
    logging.basicConfig(level=logging.INFO)

    access_token = None
    # 엑세스 토큰 발급
    if not access_token:
        access_token = get_access_token()

    logging.info(f"Access Token: {access_token}")
    
    #prompt = input()
    with Image.open(f"./images/{name}.jpeg") as img:
        buffered = io.BytesIO()
        # 이미지를 원하는 포맷으로 메모리에 저장 (JPEG, PNG 등)
        img.save(buffered, format="JPEG")
        # Base64로 인코딩
        img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    file_size = os.path.getsize(f"./images/{name}.jpeg")
    print("ready!: ")
    print(file_size)
    actual_size = calculate_file_size_from_base64(img_base64)
    print(f"Calculated File Size: {actual_size} bytes")
    # 메시지 발송
    message_key = send_message(access_token,img_base64,actual_size,prompt,phone_number)
    return message_key
    #message_key = send_message_LMS(access_token,prompt,phone_number)
    #if message_key:
     #   logging.info(f"wait...")
      #  time.sleep(10)

        # 예약 발송 취소
        #cancel_code = cancel_reservation(access_token, message_key)
        #if cancel_code:
           # logging.info(f"Cancel Success, Message Key: {message_key}")

def send_LMS(prompt, phone_number):
    logging.basicConfig(level=logging.INFO)

    access_token = None
    # 엑세스 토큰 발급
    if not access_token:
        access_token = get_access_token()

    logging.info(f"Access Token: {access_token}")

    # 메시지 발송
    message_key = send_message_LMS(access_token,prompt,phone_number)
    return message_key