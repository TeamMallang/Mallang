import re
from pydantic import BaseModel
from openai import OpenAI
from fastapi import HTTPException

# 1. API 요청 데이터 규격 정의
class TranslationRequest(BaseModel):
    city: str          # 예: "성남시(판교)"
    industry: str      # 예: "IT/소프트웨어 개발"
    user_input: str    # 예: "아 집가고 싶다"

# 2. NVIDIA 클라이언트 초기화
api_key = "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"
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=api_key
)

# 3. 실제 처세술 변환 핵심 비즈니스 로직 함수
def process_soften_language(data: TranslationRequest):
    if not data.user_input.strip():
        raise HTTPException(status_code=400, detail="내용을 입력해주세요.")

    system_instruction = (
        f"당신은 경기도 {data.city}에 위치한 {data.industry} 분야 기업의 15년 차 처세술 달인이자 인사팀장입니다. "
        f"해당 지역과 {data.industry} 업종 특유의 조직 문화를 교묘하게 반영하여, "
        f"사용자의 거친 속마음을 가장 자연스럽고 예의 바른 비즈니스 언어로 번역하세요. "
        f"결과는 오직 상사에게 보낼 수 있는 메신저/이메일용 '추천 멘트'만 명확하게 출력해야 하며, 부가 설명은 생략하세요."
    )

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"이 속마음을 해당 업종에 맞는 비즈니스 언어로 바꿔줘: {data.user_input}"}
            ],
            temperature=0.5,
            top_p=1,
            max_tokens=2048,
            stream=False 
        )

        full_response = completion.choices[0].message.content

        # AI 생각 과정 제거 필터링
        clean_response = full_response
        if "The prompt:" in clean_response:
            clean_response = clean_response.split("The prompt:")[-1]
            match = re.search(r'(?:팀장님|과장님|부장님|책임님|수석님|[가-힣]{2,}|[A-Z])', clean_response)
            if match:
                clean_response = clean_response[match.start():]

        return {"success": True, "result": clean_response.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API 호출 중 에러 발생: {str(e)}")
