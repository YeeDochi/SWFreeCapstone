import openai
import urllib.request
import asyncio
import aiohttp
from PromptMaker import prompt_maker
from ID import AIKEY

openai.api_key = AIKEY
import random

def generate_finalP(prompt, PromptAdd):
    finished_prompt1 = prompt_maker(prompt)
    finished_prompt2 = prompt_maker(PromptAdd)
    if(finished_prompt1 =="error" or finished_prompt2 =="error"):
        return "error"
    nouns = finished_prompt1+", "+finished_prompt2
    return nouns


def select_Thema(thema):
    Thematext =""
    if(thema == '0'): #일반
        Thematext = " Drawing Style : Cartoon,Not realistic,simple,colorful,2D,comic"
    if(thema == '1'): #만화
        Thematext = " Drawing Style: Vintage, Halftone texture, Black and white with bold accent colors, Dramatic shading, 2D panel style"
    if(thema == '2'): #동화
        Thematext = " Drawing Style: Whimsical, Hand-drawn, Watercolor effect, Warm and earthy tones, Storybook illustration, Organic shapes"
    if(thema == '3'): #포스터
        Thematext = " Drawing Style: Clean lines, Monochrome with pops of color, Flat design, Geometric shapes, Minimalist 2D"
    return Thematext

def generate_image(finished_prompt, image_name):
    # OpenAI API 호출로 이미지 생성
    response = openai.Image.create(
        prompt=finished_prompt,  # 이미지 생성에 사용할 프롬프트
        model="dall-e-3",
        n=1,            # 생성할 이미지 수
        size="1024x1024" # 이미지 크기 설정
    )

    # 생성된 이미지의 URL 반환
    url = response['data'][0]['url']
    urllib.request.urlretrieve(url, f"./images/{image_name}.jpeg")
    return f"http://localhost:8080/api/get_image/{image_name}"

def regenerate_image(url,image_name):
    urllib.request.urlretrieve(url, f"./images/{image_name}.jpeg")
