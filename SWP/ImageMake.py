import openai
import urllib.request
from PromptMaker import prompt_maker
from ID import AIKEY


openai.api_key = AIKEY
def generate_finalP(prompt, PromptAdd):
    finished_prompt = prompt_maker(prompt)
    finished_prompt += prompt_maker(PromptAdd)
    return finished_prompt

def select_Thema(thema):
    Thematext =""
    if(thema == '1'):
        Thematext = "Drawing Style : Cartoon,Not realistic,simple,colorful,2D,comic"
    if(thema == '2'):
        Thematext = "Drawing Style : "
    if(thema == '3'):
        Thematext = "Drawing Style : "
    return Thematext



def generate_image(finished_prompt, image_name):
    
    # OpenAI API 호출로 이미지 생성
    response = openai.Image.create(
        prompt=finished_prompt +"",  # 이미지 생성에 사용할 프롬프트
        #prompt=prompt,
        n=1,            # 생성할 이미지 수
        size="256x256" # 이미지 크기 설정
    )

    # 생성된 이미지의 URL 반환
    image_url = response['data'][0]['url']
    # 다운받을 이미지 url
    url = image_url
    urllib.request.urlretrieve(url, f"./images/{image_name}.jpeg")
    return image_url


