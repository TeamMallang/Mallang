from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
# 다른 개발자분이 짜둔 soften.py 파일에서 변환 함수를 가져옵니다.
from soften import process_soften_language

app = FastAPI()

# -----------------------------------------------------------------
# 바로 아랫줄 ['http://~'] 여기에 프론트엔드 주소를 넣으세요.
# -----------------------------------------------------------------
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# [프론트엔드 공유용] 1. 화면별 데이터 규격(Model) 정의
# ==========================================

# 1) 채팅창 데이터 구조
class ChatRequest(BaseModel):
    screen: str          # 어디 화면에 있는가 (예: "채팅창")
    message: str         # 채팅 정보
    userID: str          # ID (지역이랑 직군 정보 포함)

# 2) 로그인 데이터 구조
class LoginRequest(BaseModel):
    userID: str
    password: str

# 3) 회원가입 데이터 구조
class RegisterRequest(BaseModel):
    userID: str
    password: str
    biType: str          # 직군
    locate: str          # 지역

# 4) ID 중복확인 데이터 구조
class IdCheckRequest(BaseModel):
    userID: str


# ==========================================
# [API 엔드포인트] 2. 기능별 통로(주소) 정의
# ==========================================

# [기능 1] 채팅창 및 언어 변환 피드백
# 호출 주소: http://127.0.0
@app.post("/api/soften")
async def soften_language(data: ChatRequest):
    try:
        # 다른 개발자가 만든 soften.py 함수에 프론트가 보낸 데이터 전체를 넘깁니다.
        # AI 개발자는 data.message, data.userID 등을 사용해 로직을 짤 수 있습니다.
        ai_response = process_soften_language(data)
        
        # 프론트가 요구한 변수명인 'returnMessage'에 피드백 답변을 담아 반환합니다.
        # (soften.py에서 리턴되는 규격에 따라 필요시 아래 형식을 soften.py 내부에서 맞출 수도 있습니다)
        return {"returnMessage": ai_response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"언어 변환 처리 중 에러: {str(e)}")


# [기능 2] 로그인 처리
# 호출 주소: http://127.0.0
@app.post("/api/login")
async def login_user(data: LoginRequest):
    try:
        # TODO: 실제 DB 연동 및 로그인 검증 로직이 들어갈 자리입니다.
        is_success = True  # 성공 시 True, 실패 시 False
        
        # 프론트가 요구한 변수명 'checkID'로 성공/실패 여부를 반환합니다.
        return {"checkID": is_success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# [기능 3] 회원가입 처리
# 호출 주소: http://127.0.0
@app.post("/api/register")
async def register_user(data: RegisterRequest):
    try:
        # TODO: 실제 DB 연동 및 회원가입 로직이 들어갈 자리입니다.
        is_success = False  # 예시로 실패 상황 가정
        error_code = "error" # 중복 등의 문제 발생 시 프론트로 보낼 에러 ID (예: 프론트 66번 처리용)
        
        if is_success:
            return {"checkNewUser": True, "errorType": None}
        else:
            # 실패 시 checkNewUser는 False, 에러 형태를 errorType에 담아 보냅니다.
            return {"checkNewUser": False, "errorType": error_code}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# [기능 4] ID 중복확인 버튼 클릭 시
# 호출 주소: http://127.0.0
@app.post("/api/check-id")
async def check_id_duplication(data: IdCheckRequest):
    try:
        # TODO: DB에서 ID 중복 여부를 체크하는 로직이 들어갈 자리입니다.
        is_available = True  # 사용 가능하면 True, 중복이면 False
        
        # 프론트가 요구한 변수명 'chechIDok'로 중복 여부를 반환합니다.
        # (요청서에 적어주신 chechIDok 스펠링 그대로 반영했습니다)
        return {"chechIDok": is_available}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
