"""
말랑(Mallang) 언어 순화 모듈
- solo.py 의 /api/soften 엔드포인트가 이 파일의 process_soften_language() 를 호출합니다.
- 기존 ai/gpt.py 프로토타입 로직을 실제로 호출 가능한 함수 형태로 옮기고,
  하드코딩되어 있던 API 키는 환경변수로 분리했습니다.
- ChatRequest 에 담겨오는 biType(직군), locate(지역) 정보를 반영해
  직군/지역 특성에 맞는 어투로 순화하도록 시스템 프롬프트를 동적으로 구성합니다.

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


# ------------------------------------------------------------
# 직군별 전문용어 사전
# 실제 현장에서 쓰이는 용어를 예시로 나열 (AI가 임의로 지어내지 않도록)
# ------------------------------------------------------------
JOB_JARGON = {
    "개발/IT": "픽스, 배포, 머지, 티켓, 스프린트, 어사인, 컨펌, 얼라인, 싱크, 핫픽스, 리뷰",
    "디자인": "시안, 톤앤매너, 그리드, 목업, 컨펌, 피드백, 핸드오프, 베리에이션, 레퍼런스",
    "재무/회계": "전기, 당기, 마감, 결산, 승인요청, 품의, 정산, 대사, 충당금, 계상",
    "생산/제조": "공수, 불량률, 라인, 물량, 납기, 로트, 검수, 출하, 재작업",
    "의료/복지": "케이스, 차트, 소견, 인계, 컨설트, 처방, 라운딩, 케어플랜",
}

# ------------------------------------------------------------
# 지역(산업 클러스터)별 어투 특성
# 사투리를 직접 섞지 않고, 격식/문장 스타일 정도만 반영
# ------------------------------------------------------------
REGION_TONE = {
    "울산·거제·창원": "조선·중공업 현장 중심. 간결하고 직설적인 보고체 선호, 군더더기 없는 문장",
    "구미·평택·이천": "전자·반도체 공정 중심. 정확한 수치/공정 용어를 선호하는 담백한 보고체",
    "울산·여수·서산": "석유화학 공정 중심. 절차와 안전을 중시하는 신중하고 격식 있는 문장",
    "안산·시흥·창원": "중소 제조·협력사 밀집. 실무적이고 현실적인 화법, 완곡하되 요점 위주",
    "판교·강남": "IT·스타트업 중심. 영어 혼용이 자연스럽고, 캐주얼하면서도 명확한 격식체",
}


def _build_system_prompt(job_type: str, region: str) -> str:
    """
    사용자의 직군(biType)/지역(locate)에 맞춰 시스템 프롬프트를 동적으로 구성합니다.
    직군/지역 정보가 없거나 사전에 없는 값이면 기본값으로 대체합니다.
    """
    jargon = JOB_JARGON.get(job_type, "일반적인 업무 용어")
    tone = REGION_TONE.get(region, "표준적인 업무 격식체")

    return (
        "당신은 '말랑'이라는 이름의 사회 언어 코칭 AI입니다. "
        "사회 경험이 적은 직장인이 입력한 직설적이거나 감정적인 말을, "
        "직장에서 통용되는 부드럽고 전문적인 언어로 자연스럽게 바꿔주세요. "
        "원래 의미와 요청 사항은 유지하되, 어투만 정중하고 완곡하게 바꿉니다. "
        "절대 내용을 추가하지 말 것.\n\n"
        f"- 사용자 직군: {job_type or '정보 없음'}\n"
        f"- 근무지 특성: {region or '정보 없음'} ({tone})\n"
        f"- 이 직군에서 흔히 쓰는 용어 (자연스러울 때 1개 정도만, 억지로 넣지 말 것): {jargon}\n\n"
        "규칙:\n"
        "1. 원래 의도(질문/불만/요청)는 절대 바꾸지 마세요.\n"
        "2. 존댓말을 유지하되 반말/공격적/감정적 표현을 순화하세요.\n"
        "3. 제시된 용어를 억지로 여러 개 넣지 말고, 문맥상 자연스러울 때만 1개 정도 사용하세요.\n"
        "4. 문장은 원문보다 너무 길어지지 않게 하세요.\n"
        "5. 지역 특성은 문장 격식/스타일에만 은근히 반영하고, 사투리를 직접 사용하지 마세요.\n"
        "6. 결과 문장 외에 다른 설명이나 따옴표, 접두사를 붙이지 말고 순화된 문장만 그대로 출력하세요."
    )


def process_soften_language(data) -> str:
    """
    data: solo.py 의 ChatRequest (screen, message, userID, biType, locate 필드를 가진 Pydantic 모델)
    반환값: 순화된 문장 (문자열)
    """
    message = (data.message or "").strip()
    if not message:
        raise ValueError("변환할 메시지가 비어 있습니다.")

    system_prompt = _build_system_prompt(
        job_type=getattr(data, "biType", None),
        region=getattr(data, "locate", None),
    )

    client = _get_client()

    completion = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": system_prompt},
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