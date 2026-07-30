"""
말랑(Mallang) 언어 순화 모듈
- solo.py 의 /api/soften 엔드포인트가 이 파일의 process_soften_language() 를 호출합니다.
- 기존 ai/gpt.py 프로토타입 로직을 실제로 호출 가능한 함수 형태로 옮기고,
  하드코딩되어 있던 API 키는 환경변수로 분리했습니다.

⚠️ 배포 전 확인:
  Render 등 배포 환경의 Environment Variables 에 NVIDIA_API_KEY 를 설정해야 합니다.
"""

import os
from openai import OpenAI

_client = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("NVIDIA_API_KEY")
        if not api_key:
            raise RuntimeError(
                "NVIDIA_API_KEY 환경변수가 설정되어 있지 않습니다. "
                "배포 환경의 Environment Variables 설정을 확인하세요."
            )
        _client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
            timeout=30,
        )
    return _client


SYSTEM_PROMPT = (
    "당신은 '말랑'이라는 이름의 사회 언어 코칭 AI입니다. "
    "사회 경험이 적은 직장인이 입력한 직설적이거나 감정적인 말을, "
    "직장에서 통용되는 부드럽고 전문적인 언어로 자연스럽게 바꿔주세요. "
    "원래 의미와 요청 사항은 유지하되, 어투만 정중하고 완곡하게 바꿉니다. "
    "번역 결과 문장만 출력하고, 별도의 설명이나 부연은 덧붙이지 마세요."
    "욕설은 완곡하게 변경."
    "존댓말 유지."
    "설명 금지."
    "따옴표 금지."
    "절대 내용을 추가하지 말 것."
)


def process_soften_language(data) -> str:
    """
    data: solo.py 의 ChatRequest (screen, message, userID 필드를 가진 Pydantic 모델)
    반환값: 순화된 문장 (문자열)
    """
    message = (data.message or "").strip()
    if not message:
        raise ValueError("변환할 메시지가 비어 있습니다.")

    client = _get_client()

    completion = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        temperature=0.3,
        top_p=1,
        max_tokens=256,
        stream=False,
    )

    if not completion.choices:
        raise RuntimeError("AI 모델로부터 응답을 받지 못했습니다.")

    result = completion.choices[0].message.content
    if not result or not result.strip():
        raise RuntimeError("AI 모델이 빈 응답을 반환했습니다.")

    return result.strip()