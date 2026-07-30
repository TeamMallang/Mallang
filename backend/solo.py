from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os
import firebase_admin
from firebase_admin import credentials, firestore
# 다른 개발자분이 짜둔 soften.py 파일에서 변환 함수를 가져옵니다.
from ai.soften import process_soften_language

app = FastAPI()

# ==========================================
# [서버 연결 테스트용 기본 엔드포인트]
# ==========================================
# Render 주소(https://...onrender.com)로 직접 접속했을 때 404 에러가 나는 것을 방지합니다.
@app.get("/")
async def root():
    return {"status": "ok", "message": "Mallang Backend server is running!"}


# ==========================================
# [파이어베이스 연결 설정]
# ==========================================
# 배포 환경(Render)에서는 FIREBASE_CREDENTIALS_JSON 환경변수(JSON 전체를 문자열로)를 우선 사용하고,
# 로컬 개발 중이라 환경변수가 없으면 같은 폴더의 firebase_config.json 파일을 사용합니다.
try:
    firebase_json = os.environ.get("FIREBASE_CREDENTIALS_JSON")
    if firebase_json:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))

        cred = credentials.Certificate(
            os.path.join(BASE_DIR, "firebase_config.json")
        )
    else:
        cred = credentials.Certificate("firebase_config.json")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    db = firestore.client()
except Exception as e:
    print(f"파이어베이스 초기화 실패 (FIREBASE_CREDENTIALS_JSON 환경변수 또는 firebase_config.json 파일을 확인하세요): {e}")

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
        # 파이어베이스의 'users' 컬렉션에서 프론트엔드가 보낸 userID 문서를 조회(불러오기)합니다.
        user_doc = db.collection("users").document(data.userID).get()
        
        # 1. 가입되지 않은 아이디인 경우
        if not user_doc.exists:
            return {"checkID": False, "biType": None, "locate": None}
        
        # 2. 아이디가 존재하면 DB 안의 데이터(비밀번호, 직군, 지역)를 딕셔너리로 다 불러옵니다.
        user_data = user_doc.to_dict()
        
        # 3. 프론트가 입력한 비밀번호와 DB에 저장되어 있던 비밀번호를 대조합니다.
        if user_data.get("password") == data.password:
            # [로그인 성공] 결과(checkID: True)와 함께 DB에서 꺼내온 직군(biType)과 지역(locate)을 프론트에 넘겨줍니다!
            return {
                "checkID": True,
                "biType": user_data.get("biType"),
                "locate": user_data.get("locate")
            }
        else:
            # 비밀번호 불일치로 실패 시 정보는 비워서 보냅니다.
            return {"checkID": False, "biType": None, "locate": None}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"로그인 처리 중 DB 에러: {str(e)}")


# [기능 3] 회원가입 처리 (유저 정보를 파이어베이스 클라우드에 영구 저장)
@app.post("/api/register")
async def register_user(data: RegisterRequest):
    try:
        # 가입 버튼을 누르기 전에 중복 확인을 안 했을 상황을 대비해 DB에서 한 번 더 ID 확인을 거칩니다.
        user_ref = db.collection("users").document(data.userID)
        
        # 이미 존재하는 아이디라면 가입을 실패시키고 프론트 66번 에러 대응용 코드("error")를 전송합니다.
        if user_ref.get().exists:
            return {"checkNewUser": False, "errorType": "error"}
        
        # 중복이 아니라면 파이어베이스 Firestore 데이터베이스에 회원 정보를 칸칸이 저장합니다.
        user_ref.set({
            "password": data.password,
            "biType": data.biType,
            "locate": data.locate
        })
        
        return {"checkNewUser": True, "errorType": None}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"회원가입 처리 중 DB 에러: {str(e)}")


# [기능 4] ID 중복확인 버튼 클릭 시 (파이어베이스 실시간 단건 조회)
@app.post("/api/check-id")
async def check_id_duplication(data: IdCheckRequest):
    try:
        # 파이어베이스 데이터베이스에 이 ID를 가진 문서가 등록되어 있는지 검사합니다.
        user_doc = db.collection("users").document(data.userID).get()
        
        # 문서가 존재하지 않아야(not exists) 비어있는 아이디이므로 chechIDok에 True(사용 가능)를 반환합니다.
        is_available = not user_doc.exists
        
        return {"chechIDok": is_available}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ID 중복확인 중 DB 에러: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    # 외부 로컬 접속 및 프론트 통신을 원활하게 하기 위해 host를 "0.0.0.0"으로 변경했습니다.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)