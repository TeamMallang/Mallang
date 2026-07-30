export const CONFIG = {
  API_BASE: "https://mallang-67cb.onrender.com",
  REGIONS: [
    "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산",
    "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
  ],
  JOBS: [
    "사무/기획", "마케팅/홍보", "영업", "개발/IT", "디자인",
    "인사/총무", "재무/회계", "고객서비스", "생산/제조", "교육", "의료/복지", "기타"
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
