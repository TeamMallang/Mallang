import { CONFIG, loadSession, clearSession } from './config.js';
import { callApi } from './utils.js';

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
  const row = document.createElement("div");
  row.className = role === "user" ? "msg-row user" : "msg-row";

  const body = document.createElement("div");
  body.className = "msg-body";

  const bubble = document.createElement("div");
  bubble.className = role === "user" ? "bubble user" : "bubble bot";
  bubble.textContent = text;

  body.appendChild(bubble);
  row.appendChild(body);
  chatInner.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
}

export function initChatPage() {
  const session = loadSession();
  if (!session || !session.userID) {
    window.location.href = "login.html";
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
  const btnLight = document.getElementById("btn-light");
  const btnDark = document.getElementById("btn-dark");

  const hRegion = document.getElementById("h-region");
  const hJob = document.getElementById("h-job");
  const mRegion = document.getElementById("m-region");
  const mJob = document.getElementById("m-job");

  populateSelect(hRegion, CONFIG.REGIONS, session.locate);
  populateSelect(hJob, CONFIG.JOBS, session.biType);
  populateSelect(mRegion, CONFIG.REGIONS, session.locate);
  populateSelect(mJob, CONFIG.JOBS, session.biType);

  function syncSelects(a, b) {
    a?.addEventListener("change", () => { if (b) b.value = a.value; });
    b?.addEventListener("change", () => { if (a) a.value = b.value; });
  }
  syncSelects(hRegion, mRegion);
  syncSelects(hJob, mJob);

  const displayName = session.userID.split("@")[0];
  if (profName) profName.textContent = displayName;
  if (pdName) pdName.textContent = displayName;
  if (pdEmail) pdEmail.textContent = session.userID;

  // Theme handling
  const savedTheme = localStorage.getItem("mallang_theme") || "light";
  if (savedTheme === "dark") document.body.classList.add("dark");

  btnLight?.addEventListener("click", () => {
    document.body.classList.remove("dark");
    localStorage.setItem("mallang_theme", "light");
  });
  btnDark?.addEventListener("click", () => {
    document.body.classList.add("dark");
    localStorage.setItem("mallang_theme", "dark");
  });

  // Load recent conversations (mock data for now)
  if (convList) {
    convList.innerHTML = "";
    const mockConvs = [
      "회의 참석 여부 문의",
      "업무 분담 요청",
      "퇴근 시간 확인"
    ];
    mockConvs.forEach(title => {
      const item = document.createElement("button");
      item.className = "dd-item";
      item.style.paddingLeft = "20px";
      item.textContent = title;
      item.addEventListener("click", () => {
        chatInner.innerHTML = "";
        appendMessage(chatInner, chatArea, "user", title);
        appendMessage(chatInner, chatArea, "ai", `"${title}"에 대한 이전 대화 내용을 불러왔습니다. (데모)`);
        if (profDropdown) {
          profDropdown.classList.remove("open");
          profBtn.classList.remove("op");
          profBtn.classList.add("cl");
        }
      });
      convList.appendChild(item);
    });
  }

  profBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = profBtn.classList.contains("op");
    if (isOpen) {
      profBtn.classList.remove("op");
      profBtn.classList.add("cl");
      if (profDropdown) profDropdown.classList.remove("open");
    } else {
      profBtn.classList.remove("cl");
      profBtn.classList.add("op");
      if (profDropdown) profDropdown.classList.add("open");
    }
  });
  document.addEventListener("click", (e) => {
    const clickedInsideProfBtn = profBtn && profBtn.contains(e.target);
    const clickedInsideProfDropdown = profDropdown && profDropdown.contains(e.target);
    if (profBtn && !clickedInsideProfBtn && !clickedInsideProfDropdown) {
      profBtn.classList.remove("op");
      profBtn.classList.add("cl");
      if (profDropdown) profDropdown.classList.remove("open");
    }
  });

  logoutBtn?.addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });

  newChatBtn?.addEventListener("click", () => {
    chatInner.innerHTML = "";
  });

  chipRow?.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chatTa.value = chip.textContent;
      chatTa.dispatchEvent(new Event("input"));
      chatTa.focus();
    });
  });

  chatTa?.addEventListener("input", () => {
    sendBtn.disabled = chatTa.value.trim().length === 0;
    chatTa.style.height = "auto";
    chatTa.style.height = chatTa.scrollHeight + "px";
  });

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