export const CONFIG = {
  API_BASE: "https://mallangend.onrender.com",
  REGIONS: [
    "울산·거제·창원", "구미·평택·이천", "울산·여수·서산", "안산·시흥·창원", "판교·강남"
  ],
  JOBS: [
    "개발/IT", "디자인", "재무/회계", "생산/제조", "의료/복지", "기타"
  ],
  SESSION_KEY: "mallang_session"
};

export function saveSession(session) {
  localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(CONFIG.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(CONFIG.SESSION_KEY);
}
