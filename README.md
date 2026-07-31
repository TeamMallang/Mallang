# **NAVER OGQ PROJECT**

### [Mallang]

그 말, 말랑하게 다시 해볼까요? — 사회초년생을 위한 직장어 순화 코칭 AI

#### **[배경]**

특성화고·마이스터고를 포함한 직업계고 졸업생들은 대학 진학 대신 졸업 후 곧바로 산업 현장에 취업하는 경우가 많으며, 이는 국가적으로도 조기 취업을 통한 청년 인력 양성이라는 측면에서 장려되는 흐름임. 그러나 학교 교육과정은 대부분 직무 역량 습득에 초점이 맞춰져 있어, 정작 실제 직장에서 통용되는 암묵적 소통 방식과 조직 문화를 미리 접할 기회는 부족한 실정임. 그 결과 사회에 첫발을 내딛는 사회초년생들은 뛰어난 직무 역량을 갖추고도 조직 내 의사소통 과정에서 어려움을 겪는 경우가 빈번하며, 이는 산업 현장 조기 진입 세대가 공통적으로 마주하는 사회적 문제로 대두되고 있음.

---

#### **[문제점]**

**암묵적 직장 언어의 장벽**: 사회초년생들은 학교에서 직무 능력은 습득하지만, 실제 직장에서 통용되는 암묵적 표현과 조직 문화를 접할 기회는 거의 없음. "시간 되실 때 부탁드립니다.", "검토 한번 부탁드려요." 와 같은 표현은 겉으로는 부드럽고 여유 있는 요청처럼 들리지만, 실제 업무에서는 중요한 요청이나 즉각적인 행동을 요구하는 의미를 담고 있는 경우가 많음. 문자 그대로의 의미와 실제 업무상 의도 사이에 존재하는 이러한 간극을, 조직 문화 경험이 없는 사회초년생이 스스로 판단하기는 매우 어려움.

**해석 실패로 인한 실질적 손해**: 직장어의 뉘앙스를 제대로 파악하지 못하면 업무 우선순위를 잘못 판단하거나 요청의 긴급성을 놓쳐 업무 실수나 불필요한 오해로 이어질 수 있음. 나아가 상사·동료와의 반복적인 소통 오류는 실무 역량과는 무관하게 "일머리가 없다"는 부정적 평가로 이어져, 사회초년생의 조직 적응 자체를 저해하는 요인으로 작용함.

**물어보기 어려운 구조적 한계**: 직장어의 실제 의미는 대부분 사수나 선배를 통해 개인적으로 전수되는 데 그치고 있으며, 사회초년생 입장에서는 표현의 의미를 되묻는 행위 자체가 부담으로 작용하여 쉽게 질문하지 못하는 경우가 많음. 결국 반복적인 시행착오를 통해 스스로 체득할 수밖에 없는 구조이며, 이 과정에서 불필요한 스트레스와 조직 부적응이 누적됨.

---

#### **[해결 방안 (Mallang의 가치)]**

본 프로덕트는 사용자가 업무 중 하고 싶은 말이나 받은 메시지를 입력하면, 해당 문장을 직장에서 통용되는 부드럽고 전문적인 언어로 순화하여 알려줌. 단순히 문장을 다듬는 데 그치지 않고, 회원가입 시 입력한 직종(개발/IT, 디자인, 재무/회계, 생산/제조, 의료/복지 등)과 근무 지역(울산·거제·창원, 구미·평택·이천, 판교·강남 등 산업 클러스터 단위)을 반영해, 해당 직군에서 실제로 쓰이는 용어와 지역 특유의 격식·문장 스타일에 맞춰 결과를 다르게 생성함. 예를 들어 동일한 불만 섞인 말이라도 개발/IT 직군에게는 "어사인", "컨펌" 같은 실무 용어를 활용한 문장으로, 제조 현장이라면 더 간결하고 직설적인 보고체로 순화되어 제공됨.

원문의 의도(질문/불만/요청)는 절대 바꾸지 않고 어투만 정중하고 완곡하게 바꾸는 것을 원칙으로 하며, 채팅 화면에는 자주 쓰이는 예시 문장을 칩(chip) 형태로 제공해 처음 쓰는 사용자도 부담 없이 시작할 수 있도록 함. 또한 입력된 대화 내용은 순화 처리 즉시 폐기되고 서버에 저장되지 않아, 사내 정보가 포함된 민감한 문장도 안심하고 입력할 수 있음. 이를 통해 사회초년생은 표현의 의미나 적절한 어투를 되묻는 데 따르는 부담 없이 언제든 확인할 수 있으며, 반복적인 사용을 통해 점차 직장어의 뉘앙스를 스스로 체득해 나갈 수 있음. 궁극적으로 마이스터고 졸업생을 비롯한 사회초년생들이 조직 문화에 대한 이해 부족으로 인한 불필요한 오해와 실수를 줄이고, 보다 자신감 있는 태도로 원활히 의사소통하며 조직에 적응할 수 있도록 돕는 것이 Mallang의 핵심 가치임.

---

#### **[시스템 아키텍처]**

```
[사용자 브라우저]
   │  로그인 / 회원가입 / 채팅(직장어 순화) 화면 접근
   ▼
[Frontend: 정적 HTML/CSS/JS @ Vercel]
   html/login.html, signup.html, tanslator.html
   css/styles.css
   js/config.js   → API_BASE, REGIONS·JOBS 목록, localStorage 세션 관리(save/load/clear)
   js/utils.js    → 공통 fetch 래퍼(callApi, 타임아웃 70초), 이메일 형식 검증
   js/login.js    → 로그인 요청 → 세션 저장 → tanslator.html 이동
   js/signup.js   → 지역/직종 커스텀 셀렉트, 약관 동의, 회원가입 요청
   js/chat.js     → 지역/직종 선택 동기화, 예시 칩, 메시지 전송/렌더링, 다크모드
   │  REST 호출 (fetch, JSON)
   ▼
[Backend: FastAPI @ Render (mallangend.onrender.com)]
   solo.py — 엔드포인트 정의, CORS(Vercel 프론트 도메인만 허용)
     GET  /              헬스체크
     POST /api/login       Firestore에서 유저 문서 조회 → 비밀번호 대조
     POST /api/register    Firestore에 신규 유저 저장 (password, biType, locate)
     POST /api/check-id    아이디 중복 여부 확인
     POST /api/soften       직장어 순화 요청 → mallang_soften.process_soften_language() 호출
   │
   ├─ firebase_utils.py
   │     환경변수(FIREBASE_CONFIG 또는 FIREBASE_CREDENTIALS_JSON)로 서비스 계정 인증
   │     Firebase Admin SDK 초기화 → Firestore client(db) 전역 제공
   │
   └─ mallang_soften.py
         JOB_JARGON(직군별 용어 사전), REGION_TONE(지역별 어투 특성),
         FEW_SHOT_EXAMPLES(직군별 예시)를 조합해 시스템 프롬프트를 동적으로 구성
         NVIDIA API(OpenAI 호환, integrate.api.nvidia.com)로 gpt-oss-20b 모델 호출
   ▼
[Firebase Firestore]  users 컬렉션(userID, password, biType, locate) — 계정 정보만 저장
[NVIDIA API]           openai/gpt-oss-20b 모델 추론 — 대화 내용은 저장하지 않고 즉시 폐기
```

핵심 설계 포인트:
- 채팅 문장 자체는 어떤 DB에도 저장하지 않고 순화 처리 후 즉시 폐기하며, Firestore에는 계정 정보(아이디·비밀번호·직군·지역)만 저장해 대화 내용 관련 개인정보 리스크를 최소화함.
- 회원가입 시 수집한 직군(biType)·지역(locate) 정보를 매 요청마다 프롬프트에 동적으로 반영해, 동일한 문장이라도 직군별 용어·지역별 격식에 맞춰 다르게 순화되도록 설계함.
- Firestore 동기 호출을 `asyncio.to_thread` + `asyncio.wait_for`(10초 타임아웃)로 감싸 이벤트 루프 블로킹을 막고, 응답 지연 시 504로 즉시 실패 처리함.

---

#### **[사용 스택]**

| **분류** | **기술 스택** |
| --- | --- |
| Backend | Python, FastAPI, Uvicorn |
| AI 연동 | openai SDK (NVIDIA 통합 API, OpenAI 호환 인터페이스) |
| Database | Firebase Firestore (firebase-admin SDK) |
| Frontend | HTML, CSS, JavaScript (Vanilla, ES Modules) |
| 세션 관리 | 브라우저 localStorage |
| 배포 | Vercel(Frontend), Render(Backend) |
| CI/CD | GitHub Actions (`.github/workflows`) |

---

#### **[실행 방법]**

```bash
# 0. 사전 준비
#    - Python 3.x
#    - Firebase 프로젝트(Firestore 활성화) 및 서비스 계정 키
#    - NVIDIA API 키 (integrate.api.nvidia.com, gpt-oss-20b 모델 사용)

# 1. 백엔드
cd backend
pip install -r requirements.txt

# 환경변수 설정 (.env 또는 배포 환경의 Environment Variables)
#   NVIDIA_API_KEY=...                        # mallang_soften.py 에서 사용
#   FIREBASE_CONFIG=...                       # 서비스 계정 JSON 문자열 (Render 등 배포 환경용)
#   FIREBASE_CREDENTIALS_JSON=...             # 위와 동일한 역할(기존 호환용), 둘 중 하나만 있어도 됨
#   (둘 다 없을 경우 로컬의 firebase_config.json 파일을 사용)

uvicorn solo:app --host 0.0.0.0 --port 8000 --reload

# 2. 프론트엔드
# 별도 빌드 과정 없는 정적 파일(html/, css/, js/, assets/) 구조
# js/config.js 의 API_BASE 를 로컬 백엔드 주소(http://localhost:8000)로 맞춘 뒤
# 로컬 정적 서버(예: npx serve .)로 실행하거나 vercel dev 로 확인
# 실제 배포 시에는 vercel.json 의 rewrites 규칙에 따라
# /login, /signup, /chat 경로가 각각 html/login.html, signup.html, tanslator.html 로 매핑됨

# 배포는 GitHub 연동 자동배포: backend → Render(rootDir: backend), frontend → Vercel
```

---

#### **[AI 사용 내역]**

<!-- TODO: 개발 과정(코드 작성/리뷰 등)에서 사용한 AI 툴을 나열해주세요. 예: Claude, ChatGPT 등 -->

---

#### **[라이선스]**

MIT License

---

#### **[사용한 AI 모델]**

직장어 해석 및 상황별 의미 분석 모델(gpt-oss-20b / LLM)

---

#### **[오픈소스 패키지]**

**Backend**

| 패키지 | 용도 |
| --- | --- |
| fastapi | HTTP API 서버 프레임워크, 라우팅 및 Pydantic 기반 요청 모델 검증 |
| uvicorn | FastAPI 앱을 구동하는 ASGI 서버 |
| pydantic | ChatRequest / LoginRequest / RegisterRequest / IdCheckRequest 등 요청 바디 스키마 정의 |
| firebase-admin | Firebase Admin SDK — Firestore 인증 및 users 컬렉션 CRUD |
| openai | NVIDIA 통합 API(OpenAI 호환 인터페이스)를 통해 gpt-oss-20b 모델 호출 |

**Frontend**

프론트엔드는 별도의 빌드 도구나 프레임워크 없이 순수 HTML/CSS/JavaScript(ES Modules)로 작성되어 있어, 관리 대상 오픈소스 패키지는 없음.

---

#### [외부 자문(교사/현직자)]

말랑 프로젝트는 직장 초년생의 원활한 의사소통을 돕는다는 문제의식이 명확하고, 완성도가 높다. 하지만 검토가 필요한 사항이 있어 아래와 같이 정리한다.

1. 보안
  - 비밀번호 처리 방식에서 보안상 취약한 부분이 있다. 
  - 실제 서비스 운영 시 중요한 사안이므로 우선적으로 점검할 필요가 있다.

2. 기능 개선
  - 서로 다른 입력에 대해 유사한 답변이 반환되거나, 답변 생성에 시간이 오래 걸리는 경우가 있어 개선이 필요하다.
  - 답변을 한 번에 복사할 수 있는 기능을 추가하면 편의성이 향상될 것이다. 사용자가 결과물을 다른 곳에 활용하는 것이 주된 목적이기 때문이다.
  - '코칭 AI'라는 서비스 목적에 맞춰, 문장 변화에 그치지 않고 변경 이유나 표현 팁을 함께 제공하면 사용자의 역량과 만족도가 향상될 수 있다.

3. 지역 선택 기능의 실효성
  - 판교·IT 직군을 제외하면 지역에 따른 결과 차이가 뚜렷하게 드러나지 않는다.
  - 실제 상황에서는 지역보다 대화 상대와의 관계(동료 / 상사 / 부하)가 더 중요한 요소로 판단된다.
  - 주 사용자가 신입인 점을 고려하여, 기본값을 '상사'로 설정하거나 회원가입 시 상대의 직급 정보를 추가로 수집하는 방안이 있다.

4. 어조(뉘앙스) 선택 기능
  - 정중한 표현만 제공하기보다, 상황에 따라 다양한 어조가 필요하다. 
  - 사용자가 어조를 선택할 수 있게 하면(간결하게 / 단호하게 / 격식 있게 / 편안하게 등) 활용도가 높아지며, 앞서 언급한 '유사 답변 반복' 문제도 자연스럽게 해결될 수 있다.

5. 데이터 확보 전략
  - 서비스의 목적과 방향성은 우수하나, 데이터 확보 방안에 대한 구체적인 고민이 필요하다.
  - AI 서비스는 답변에 대한 피드백을 통해 발전하며, 순화된 문장의 적절성은 사용자 본인보다 해당 메시지를 받는 상대(주로 상사)의 평가가 더 중요하다. 따라서 메세지를 받은 상대방의 반응을 수집하여 개선 데이터로 활용하는 방안을 고려할 필요가 있다.
  - 이에 더해, 사용자 간에 서로의 상황과 변환 결과를 공유하고 의견을 나눌 수 있는 소통 기능을 마련하는 것도 데이터 확보에 효과적일 것이다.