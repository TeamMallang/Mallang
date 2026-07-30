// =====================================================================
// 말랑(Mallang) 프론트엔드 ↔ 백엔드(solo.py) 중계 스크립트
// /login, /signup, /chat 세 페이지(각 html/login.html, html/signup.html, html/chat.html)에서 공통으로 로드됩니다.
// 현재 페이지에 어떤 요소가 있는지 감지해서 그 페이지에 맞는 로직만 실행합니다.
// =====================================================================

// ---------------------------------------------------------------
// 0. 공통 설정
// ---------------------------------------------------------------
const CONFIG = {
  // TODO: 배포 시 실제 백엔드 주소로 교체하세요 (예: https://mallang-backend.onrender.com)
  API_BASE: "https://mallangtest.onrender.com",

  // ⚠️ 임시 샘플 목록입니다. 실제 지역/직종 목록으로 교체해주세요.
  REGIONS: [
    "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산",
    "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
  ],
  JOBS: [
    "사무/기획", "마케팅/홍보", "영업", "개발/IT", "디자인",
    "인사/총무", "재무/회계", "고객서비스", "생산/제조", "교육", "의료/복지", "기타"
  ],

  SESSION_KEY: "mallang_session" // localStorage에 로그인 정보를 저장할 키
};

// ---------------------------------------------------------------
// 1. 세션(로그인 상태) 관리 — 백엔드에 토큰 개념이 없으므로
//    로그인 성공 시 받은 정보를 localStorage에 직접 보관합니다.
// ---------------------------------------------------------------
function saveSession(session) {
  localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
}
function loadSession() {
  try {
    const raw = localStorage.getItem(CONFIG.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function clearSession() {
  localStorage.removeItem(CONFIG.SESSION_KEY);
}

// ---------------------------------------------------------------
// 2. 백엔드 호출 공용 함수
// ---------------------------------------------------------------
async function callApi(path, body, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${CONFIG.API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("서버 응답이 너무 오래 걸립니다. 잠시 후 다시 시도해주세요.");
    }
    // 네트워크 자체가 끊긴 경우 (CORS 차단, 서버 다운, 오프라인 등)
    throw new Error("서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.");
  } finally {
    clearTimeout(timer);
  }

  // solo.py는 실패 시 HTTPException(status_code=500, detail="...")을 던짐
  if (!res.ok) {
    let detail = `서버 응답 오류 (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson.detail) detail = errJson.detail;
    } catch (e) { /* json 파싱 실패 시 기본 메시지 사용 */ }
    throw new Error(detail);
  }

  try {
    return await res.json();
  } catch (e) {
    throw new Error("서버 응답을 해석할 수 없습니다.");
  }
}

// ---------------------------------------------------------------
// 공용 유효성 검사 헬퍼
// ---------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(v) {
  return EMAIL_RE.test(v);
}

// ---------------------------------------------------------------
// 3. 로그인 페이지 (/login)
// ---------------------------------------------------------------
function initLoginPage() {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const loginBtn = document.getElementById("login-btn");
  const goSignupBtn = document.getElementById("go-signup-btn");
  const statusEl = document.getElementById("login-status");

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  goSignupBtn?.addEventListener("click", () => {
    window.location.href = "/signup";
  });

  loginBtn?.addEventListener("click", async () => {
    if (!emailInput || !passwordInput) {
      setStatus("페이지 로딩에 문제가 있습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    const userID = emailInput.value.trim();
    const password = passwordInput.value;

    if (!userID || !password) {
      setStatus("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    if (!isValidEmail(userID)) {
      setStatus("올바른 이메일 형식이 아닙니다.");
      return;
    }

    loginBtn.disabled = true;
    setStatus("로그인 중...");

    try {
      const data = await callApi("/api/login", { userID, password });

      if (data.checkID) {
        saveSession({ userID, biType: data.biType, locate: data.locate });
        window.location.href = "/chat";
      } else {
        setStatus("이메일 또는 비밀번호가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      setStatus("로그인 중 오류가 발생했습니다: " + err.message);
    } finally {
      loginBtn.disabled = false;
    }
  });
}

// ---------------------------------------------------------------
// 4. 회원가입 페이지 (/signup)
// ---------------------------------------------------------------
function setupCustomSelect(wrapId, options) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return { getValue: () => "", getPlaceholder: () => "" };

  const btn = wrap.querySelector(".csel-btn");
  const valSpan = wrap.querySelector(".csel-val");
  const menu = document.getElementById(`${wrapId}-menu`);

  // 필수 요소가 없으면 안전하게 빈 선택기로 동작
  if (!btn || !valSpan || !menu) {
    console.warn(`setupCustomSelect: missing elements for ${wrapId}`);
    return { getValue: () => "", getPlaceholder: () => (valSpan ? valSpan.textContent : "") };
  }

  const placeholder = valSpan.textContent || "";
  let selected = "";

  menu.innerHTML = "";
  options.forEach((opt) => {
    const item = document.createElement("div");
    item.className = "csel-item";
    item.textContent = opt;
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      selected = opt;
      valSpan.textContent = opt;
      menu.style.display = "none";
      menu.classList.remove("open");
    });
    menu.appendChild(item);
  });

  menu.style.display = "none"; // 기본 닫힘 상태

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu.style.display === "block";
    menu.style.display = isOpen ? "none" : "block";
    menu.classList.toggle("open", !isOpen);
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) {
      menu.style.display = "none";
      menu.classList.remove("open");
    }
  });

  return {
    getValue: () => selected,
    getPlaceholder: () => placeholder
  };
}

function initSignupPage() {
  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const passwordConfirmInput = document.getElementById("signup-password-confirm");
  const backBtn = document.getElementById("back-btn");
  const signupBtn = document.getElementById("signup-btn");
  const statusEl = document.getElementById("signup-status");

  const checkWrap = document.getElementById("check-wrap");
  const checkBox = document.getElementById("check-box");
  const termsToggleA = document.getElementById("terms-toggle-a");
  const ppToggleA = document.getElementById("pp-toggle-a");
  const termsBox = document.getElementById("terms-box");

  const regionSelect = setupCustomSelect("csel-region", CONFIG.REGIONS);
  const jobSelect = setupCustomSelect("csel-job", CONFIG.JOBS);

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  backBtn?.addEventListener("click", () => {
    window.location.href = "/login";
  });

  // 약관 내용 박스는 기본적으로 접어두고, 링크 클릭 시 펼쳐 보여줍니다.
  if (termsBox) termsBox.style.display = "none";
  function toggleTermsBox(e) {
    e.preventDefault();
    termsBox.style.display = termsBox.style.display === "none" ? "block" : "none";
  }
  termsToggleA?.addEventListener("click", toggleTermsBox);
  ppToggleA?.addEventListener("click", toggleTermsBox);

  // 체크박스: 클릭 시 동의 상태 토글 → 가입 버튼 활성화 여부 결정
  let agreed = false;
  checkWrap?.addEventListener("click", () => {
    agreed = !agreed;
    checkBox.classList.toggle("checked", agreed);
    signupBtn.disabled = !agreed;
  });

  signupBtn?.addEventListener("click", async () => {
    if (!nameInput || !emailInput || !passwordInput || !passwordConfirmInput) {
      setStatus("페이지 로딩에 문제가 있습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    const name = nameInput.value.trim(); // 참고용으로만 사용, 백엔드로는 전송하지 않음
    const userID = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    const locate = regionSelect.getValue(); // 선택 안 하면 ""
    const biType = jobSelect.getValue();

    if (!userID || !password) {
      setStatus("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (!isValidEmail(userID)) {
      setStatus("올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (password.length < 8) {
      setStatus("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setStatus("비밀번호가 일치하지 않습니다.");
      return;
    }

    signupBtn.disabled = true;
    setStatus("가입 처리 중...");

    try {
      const data = await callApi("/api/register", { userID, password, biType, locate });

      if (data.checkNewUser) {
        setStatus("가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
        setTimeout(() => (window.location.href = "/login"), 800);
      } else {
        setStatus("이미 가입된 이메일입니다.");
        signupBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      setStatus("가입 중 오류가 발생했습니다: " + err.message);
      signupBtn.disabled = false;
    }
  });
}

// ---------------------------------------------------------------
// 5. 번역기(채팅) 페이지 (/chat)
// ---------------------------------------------------------------
function populateSelect(selectEl, options, currentValue) {
  if (!selectEl) return;
  options.forEach((opt) => {
    const optionEl = document.createElement("option");
    optionEl.value = opt;
    optionEl.textContent = opt;
    selectEl.appendChild(optionEl);
  });
  if (currentValue) selectEl.value = currentValue;
}

function appendMessage(chatInner, chatArea, role, text) {
  const bubble = document.createElement("div");
  bubble.className = role === "user" ? "msg msg-user" : "msg msg-ai";
  bubble.textContent = text;
  chatInner.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function initChatPage() {
  const session = loadSession();
  if (!session || !session.userID) {
    // 로그인 안 된 상태로 접근 시 로그인 페이지로
    window.location.href = "/login";
    return;
  }

  const chatArea = document.getElementById("chat-area");
  const chatInner = document.getElementById("chat-inner");
  const chatTa = document.getElementById("chat-ta");
  const sendBtn = document.getElementById("send-btn");
  const chipRow = document.getElementById("chip-row");
  const newChatBtn = document.getElementById("new-chat-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const profBtn = document.getElementById("prof-btn");
  const profDropdown = document.getElementById("prof-dropdown");
  const profName = document.querySelector(".prof-name");
  const pdName = document.querySelector(".pd-name");
  const pdEmail = document.querySelector(".pd-email");
  const convList = document.getElementById("conv-list");

  const hRegion = document.getElementById("h-region");
  const hJob = document.getElementById("h-job");
  const mRegion = document.getElementById("m-region");
  const mJob = document.getElementById("m-job");

  // 지역/직종 select 채우기 (데스크톱/모바일 둘 다), 로그인 시 저장된 값 기본 선택
  populateSelect(hRegion, CONFIG.REGIONS, session.locate);
  populateSelect(hJob, CONFIG.JOBS, session.biType);
  populateSelect(mRegion, CONFIG.REGIONS, session.locate);
  populateSelect(mJob, CONFIG.JOBS, session.biType);

  // 데스크톱 select와 모바일 select 값 동기화
  function syncSelects(a, b) {
    a?.addEventListener("change", () => { if (b) b.value = a.value; });
    b?.addEventListener("change", () => { if (a) a.value = b.value; });
  }
  syncSelects(hRegion, mRegion);
  syncSelects(hJob, mJob);

  // 프로필 정보 표시 (백엔드가 이름을 따로 저장하지 않으므로 이메일 앞부분을 표시명으로 사용)
  const displayName = session.userID.split("@")[0];
  if (profName) profName.textContent = displayName;
  if (pdName) pdName.textContent = displayName;
  if (pdEmail) pdEmail.textContent = session.userID;

  // 최근 대화 목록: 이번 연동 범위에서는 제외 (백엔드에 대화 저장 기능이 없음)
  if (convList) convList.innerHTML = "";

  // 프로필 드롭다운 열고 닫기
  profBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    profBtn.classList.toggle("closed");
  });
  document.addEventListener("click", (e) => {
    // profDropdown가 없을 수 있으므로 안전하게 검사
    const clickedInsideProfBtn = profBtn && profBtn.contains(e.target);
    const clickedInsideProfDropdown = profDropdown && profDropdown.contains(e.target);
    if (profBtn && !clickedInsideProfBtn && !clickedInsideProfDropdown) {
      profBtn.classList.add("closed");
    }
  });

  // 로그아웃
  logoutBtn?.addEventListener("click", () => {
    clearSession();
    window.location.href = "/login";
  });

  // 새 채팅: 화면의 대화만 초기화 (서버에 저장된 대화가 없으므로 별도 API 호출 불필요)
  newChatBtn?.addEventListener("click", () => {
    chatInner.innerHTML = "";
  });

  // 추천 문구 칩 클릭 시 입력창에 채워넣기
  chipRow?.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chatTa.value = chip.textContent;
      chatTa.dispatchEvent(new Event("input"));
      chatTa.focus();
    });
  });

  // 입력창 상태에 따라 전송 버튼 활성화
  chatTa?.addEventListener("input", () => {
    sendBtn.disabled = chatTa.value.trim().length === 0;
    // 줄바꿈에 따라 textarea 높이 자동 조절
    chatTa.style.height = "auto";
    chatTa.style.height = chatTa.scrollHeight + "px";
  });

  // Enter 전송 / Shift+Enter 줄바꿈
  chatTa?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  sendBtn?.addEventListener("click", sendMessage);

  async function sendMessage() {
    const message = chatTa.value.trim();
    if (!message) return;

    appendMessage(chatInner, chatArea, "user", message);
    chatTa.value = "";
    chatTa.style.height = "auto";
    sendBtn.disabled = true;

    try {
      const data = await callApi("/api/soften", {
        screen: "채팅창",
        message,
        userID: session.userID
      });
      appendMessage(chatInner, chatArea, "ai", data.returnMessage);
    } catch (err) {
      console.error(err);
      appendMessage(chatInner, chatArea, "ai", "죄송해요, 답변을 가져오는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  }
}

// ---------------------------------------------------------------
// 6. 현재 페이지 감지 후 해당 초기화 함수 실행
// ---------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("page-login")) {
    initLoginPage();
  } else if (document.getElementById("page-signup")) {
    initSignupPage();
  } else if (document.getElementById("page-translator")) {
    initChatPage();
  }
});