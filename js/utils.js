import { CONFIG } from './config.js';

export async function callApi(path, body, timeoutMs = 15000) {
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
    throw new Error("서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.");
  } finally {
    clearTimeout(timer);
  }

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(v) {
  return EMAIL_RE.test(v);
}