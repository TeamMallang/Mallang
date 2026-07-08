from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# 1. CORS 설정 (실제 프론트엔드 주소로 변경하세요)
allow_origins = [
    # "http://localhost:3000",  # 로컬 테스트용
    "https://mallang-test-d28t.vercel.app" # 실제 배포용
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 프론트엔드 데이터 구조 정의
class TextData(BaseModel):
    text: str

@app.post("/api/message")
async def receive_and_send_text(data: TextData):
    try:
        # 공백 제거 후 텍스트가 비어있는지 검사 (에러 처리 1)
        if not data.text or not data.text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="텍스트 내용이 비어 있습니다. 글을 입력해 주세요."
            )
        
        # [백엔드 처리 구역] 실제 비즈니스 로직 작성
        user_text = data.text.strip()
        processed_text = f"백엔드가 신호를 받았습니다! 당신이 보낸 글: {user_text}"
        
        # 정상 응답 보내기
        return {"reply": processed_text}

    except HTTPException as http_err:
        # 이미 정의한 HTTP 에러는 그대로 통과
        raise http_err
    except Exception as e:
        # 예상치 못한 시스템 서버 에러 처리 (에러 처리 2)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"서버 내부 오류가 발생했습니다: {str(e)}"
        )