from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# =================================================================
# 바로 아랫줄: AI 개발자가 줄 파일명(ai_module)과 함수명(get_ai_response)입니다.
# AI 개발자가 파일명이나 함수명을 다르게 지었다면 이름만 변경하면 됩니다.
# =================================================================
try:
    from ai_module import get_ai_response
except ImportError:
    # 아직 AI 코드를 안 받았을 때, 서버 작동 테스트를 위한 임시 함수입니다.
    def get_ai_response(text: str) -> str:
        return f"[테스트] 받은 글: '{text}' (이 메시지가 보이면 아직 ai_module.py 파일이 없는 것입니다)"

app = FastAPI()

# -----------------------------------------------------------------
# 바로 아랫줄 ['http://~', 'http://~'] 여기에 프론트엔드 주소를 넣으세요.
# -----------------------------------------------------------------
origins = ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

# 프론트엔드로부터 글을 받을 데이터 규격
class UserRequest(BaseModel):
    text: str


# 프론트엔드가 요청을 보낼 주소: http://127.0.0
@app.post("/api/chat")
async def process_message(request: UserRequest):
    try:
        # 1. 프론트엔드에서 전달받은 글 추출
        user_text = request.text
        
        # 2. AI 개발자가 짜준 함수에 글을 넘기고 결과 받기
        ai_reply = get_ai_response(user_text)
        
        # 3. 프론트엔드로 최종 결과 전송
        return {"status": "success", "reply": ai_reply}
        
    except Exception as e:
        # 에러 발생 시 프론트엔드로 에러 메시지 전송
        raise HTTPException(status_code=500, detail=f"AI 모듈 연동 에러: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    # 외부 접속을 허용하려면 host를 "0.0.0.0"으로 변경하세요.
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)