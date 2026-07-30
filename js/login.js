import { callApi } from './utils.js';
import { saveSession } from './config.js';
import { isValidEmail } from './utils.js';

export function initLoginPage() {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const loginBtn = document.getElementById("login-btn");
  const goSignupBtn = document.getElementById("go-signup-btn");
  const statusEl = document.getElementById("login-status");

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  goSignupBtn?.addEventListener("click", () => {
    window.location.href = "signup.html";
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
        window.location.href = "tanslator.html";
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
