import { CONFIG } from './config.js';
import { callApi, isValidEmail } from './utils.js';

function setupCustomSelect(wrapId, options) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return { getValue: () => "", getPlaceholder: () => "" };

  const btn = wrap.querySelector(".csel-btn");
  const valSpan = wrap.querySelector(".csel-val");
  const menu = document.getElementById(`${wrapId}-menu`);

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

  menu.style.display = "none";

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

export function initSignupPage() {
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
    window.location.href = "login.html";
  });

  if (termsBox) termsBox.style.display = "none";
  function toggleTermsBox(e) {
    e.preventDefault();
    termsBox.style.display = termsBox.style.display === "none" ? "block" : "none";
  }
  termsToggleA?.addEventListener("click", toggleTermsBox);
  ppToggleA?.addEventListener("click", toggleTermsBox);

  let agreed = false;
  checkWrap?.addEventListener("click", () => {
    agreed = !agreed;
    checkBox.classList.toggle("on", agreed);
    signupBtn.disabled = !agreed;
  });

  signupBtn?.addEventListener("click", async () => {
    if (!nameInput || !emailInput || !passwordInput || !passwordConfirmInput) {
      setStatus("페이지 로딩에 문제가 있습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    const name = nameInput.value.trim();
    const userID = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    const locate = regionSelect.getValue();
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
        setTimeout(() => (window.location.href = "login.html"), 800);
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
