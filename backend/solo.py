from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio
import json
import os

from mallang_soften import process_soften_language
from firebase_utils import db

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "ok", "message": "Mallang Backend server is running!"}

# -----------------------------------------------------------------
# 바로 아랫줄 ['http://~'] 여기에 프론트엔드 주소를 넣으세요.
# -----------------------------------------------------------------
origins = ["https://mallang-test-d28t.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용 (GET, POST 등)
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

# DB 호출 하나당 대기할 최대 시간(초). 이 시간 넘으면 504로 즉시 응답합니다.
DB_TIMEOUT = 10.0


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

# [기능 1] 채팅창 및 언어 변환 피드백 (프론트 <-> 백엔드 <-> AI 모듈 연결)
@app.post("/api/soften")
async def soften_language(data: ChatRequest):
    try:
        # 프론트엔드에서 받은 데이터를 AI 개발자가 만든 soften.py 함수로 통째로 토스합니다.
        ai_response = process_soften_language(data)

        # 프론트가 요구한 변수명인 'returnMessage'에 AI 피드백 답변을 담아 반환합니다.
        return {"returnMessage": ai_response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"언어 변환 처리 중 에러: {str(e)}")


# [기능 2] 로그인 처리 (파이어베이스에서 데이터 불러오기 및 검증 확장)
@app.post("/api/login")
async def login_user(data: LoginRequest):
    try:
        # Firestore 동기 호출을 별도 쓰레드로 돌려서 이벤트 루프가 멈추지 않게 하고,
        # DB_TIMEOUT초 안에 응답이 없으면 즉시 타임아웃 처리합니다.
        user_doc = await asyncio.wait_for(
            asyncio.to_thread(
                lambda: db.collection("users").document(data.userID).get()
            ),
            timeout=DB_TIMEOUT,
        )

        # 1. 가입되지 않은 아이디인 경우
        if not user_doc.exists:
            return {"checkID": False, "biType": None, "locate": None}

        # 2. 아이디가 존재하면 DB 안의 데이터(비밀번호, 직군, 지역)를 딕셔너리로 다 불러옵니다.
        user_data = user_doc.to_dict()

        # 3. 프론트가 입력한 비밀번호와 DB에 저장되어 있던 비밀번호를 대조합니다.
        if user_data.get("password") == data.password:
            return {
                "checkID": True,
                "biType": user_data.get("biType"),
                "locate": user_data.get("locate"),
            }
        else:
            return {"checkID": False, "biType": None, "locate": None}

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="로그인 처리 중 DB 응답 시간 초과")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"로그인 처리 중 DB 에러: {str(e)}")


# [기능 3] 회원가입 처리 (유저 정보를 파이어베이스 클라우드에 영구 저장)
@app.post("/api/register")
async def register_user(data: RegisterRequest):
    try:
        user_ref = db.collection("users").document(data.userID)

        # 중복 확인 (동기 호출 -> 쓰레드로 분리 + 타임아웃)
        existing = await asyncio.wait_for(
            asyncio.to_thread(lambda: user_ref.get()),
            timeout=DB_TIMEOUT,
        )

        if existing.exists:
            return {"checkNewUser": False, "errorType": "error"}

        # 신규 저장 (동기 호출 -> 쓰레드로 분리 + 타임아웃)
        await asyncio.wait_for(
            asyncio.to_thread(
                lambda: user_ref.set(
                    {
                        "password": data.password,
                        "biType": data.biType,
                        "locate": data.locate,
                    }
                )
            ),
            timeout=DB_TIMEOUT,
        )

        return {"checkNewUser": True, "errorType": None}

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="회원가입 처리 중 DB 응답 시간 초과")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"회원가입 처리 중 DB 에러: {str(e)}")


# [기능 4] ID 중복확인 버튼 클릭 시 (파이어베이스 실시간 단건 조회)
@app.post("/api/check-id")
async def check_id_duplication(data: IdCheckRequest):
    try:
        user_doc = await asyncio.wait_for(
            asyncio.to_thread(
                lambda: db.collection("users").document(data.userID).get()
            ),
            timeout=DB_TIMEOUT,
        )

        is_available = not user_doc.exists

        return {"chechIDok": is_available}

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="ID 중복확인 중 DB 응답 시간 초과")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ID 중복확인 중 DB 에러: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("solo:app", host="0.0.0.0", port=8000, reload=True)