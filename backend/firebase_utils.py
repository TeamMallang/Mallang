import json
import os
import firebase_admin
from firebase_admin import credentials, firestore

def initialize_firebase():
    try:
        # 1. Render.com 환경변수 (FIREBASE_CONFIG) 확인
        firebase_json = os.environ.get("FIREBASE_CONFIG")
        
        # 2. 기존 환경변수 (FIREBASE_CREDENTIALS_JSON) 호환성 유지
        if not firebase_json:
            firebase_json = os.environ.get("FIREBASE_CREDENTIALS_JSON")

        if firebase_json:
            # JSON 문자열을 파싱하여 인증 정보로 사용
            cred_dict = json.loads(firebase_json)
            cred = credentials.Certificate(cred_dict)
        else:
            # 환경변수가 없으면 로컬 파일 사용
            cred = credentials.Certificate("firebase_config.json")
            
        firebase_admin.initialize_app(cred)
        return firestore.client()
    except Exception as e:
        print(f"파이어베이스 초기화 실패: {e}")
        return None

db = initialize_firebase()