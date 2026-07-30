import json
import os
import firebase_admin
from firebase_admin import credentials, firestore

def initialize_firebase():
    try:
        firebase_json = os.environ.get("FIREBASE_CREDENTIALS_JSON")
        if firebase_json:
            cred = credentials.Certificate(json.loads(firebase_json))
        else:
            cred = credentials.Certificate("firebase_config.json")
        firebase_admin.initialize_app(cred)
        return firestore.client()
    except Exception as e:
        print(f"파이어베이스 초기화 실패 (FIREBASE_CREDENTIALS_JSON 환경변수 또는 firebase_config.json 파일을 확인하세요): {e}")
        return None

db = initialize_firebase()
