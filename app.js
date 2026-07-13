// ────────────────────────────────────────────────────────────────────────────
// 말랑 — app.js (깡통 UI 버전)
//
// ⚠️ 이 파일은 실제 기능(인증, 번역 API, 대화 저장 등)이 전부 빠진 상태입니다.
//    각 TODO 주석 자리에 백엔드/프론트엔드 담당자가 실제 로직을 채워 넣으면 됩니다.
//    페이지 전환, 애니메이션, 드롭다운 열고 닫기 같은 순수 UI 동작만 살아있어서
//    디자인/레이아웃 확인용으로 그대로 클릭해볼 수 있습니다.
// ────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("mallang-root");

  // ── UI 표시용 정적 데이터 (드롭다운 옵션 목록) ─────────────────
  // TODO(backend): 필요 시 서버 API에서 지역/직종 목록을 받아오도록 교체 가능
  const REGIONS = ["서울","부산","대구","인천","광주","대전","울산","경기","강원","충북","충남","전북","전남","경북","경남","제주"];
  const JOBS    = ["IT / 개발","마케팅 / 홍보","영업 / 영업관리","인사 / 총무","회계 / 재무","디자인 / 크리에이티브","제조 / 생산","의료 / 제약","교육 / 강사","법률 / 법무","건설 / 시공","유통 / 물류"];

  const WELCOME = "안녕하세요! 저는 말랑이에요 😊\n\n\"그 말, 말랑하게 다시 해볼까요?\"\n\n하고 싶은 말을 솔직하게 입력하면, 직장에서 통하는 부드러운 언어로 바꿔드릴게요.\n\n근무 지역과 직종을 설정하면 더 딱 맞는 번역을 해드릴 수 있어요!";

  // ── UI 상태값 (화면 표시용, 실제 저장/인증과는 무관) ─────────────
  let agreed = false, region = "", job = "";
  let curConvId = null;
  let curMsgs = [{ role: "bot", text: WELCOME }];

  // TODO(backend): 로그인한 사용자의 대화 목록을 서버에서 받아와 채워주세요.
  let convList = [];

  // ── DOM 헬퍼 ──────────────────────────────────────────────
  const $  = (id) => root.querySelector("#" + id);
  const $$ = (sel) => root.querySelectorAll(sel);

  function goTo(id) {
    $$(".page").forEach(p => p.classList.remove("active"));
    $("page-" + id).classList.add("active");
    if (id === "translator") { renderChat(); renderConvList(); }
  }

  // ── 버튼 클릭 시 통통 튀는 애니메이션 (순수 UI 연출) ──────────
  root.addEventListener("click", e => {
    const btn = e.target.closest(".mallang-btn");
    if (!btn || btn.disabled) return;
    btn.classList.remove("mallang-bounce");
    void btn.offsetWidth;
    btn.classList.add("mallang-bounce");
    btn.addEventListener("animationend", () => btn.classList.remove("mallang-bounce"), { once: true });
  });

  // ── 화면 전환(로그인 / 회원가입 / 번역기) ─────────────────────
  $("login-btn").onclick = () => {
    // TODO(backend): 이메일/비밀번호 검증 + 로그인 API 호출
    // TODO(frontend): 로딩 상태, 에러 메시지(잘못된 비밀번호 등) UI 처리
    // 성공 시 아래 호출로 번역기 화면으로 이동
    goTo("translator");
  };
  $("go-signup-btn").onclick = () => goTo("signup");
  $("back-btn").onclick      = () => goTo("login");
  $("signup-btn").onclick = () => {
    // TODO(backend): 입력값(이름/이메일/비밀번호/지역/직종) 검증 + 회원가입 API 호출
    // TODO(frontend): 이메일 중복, 비밀번호 규칙 등 에러 UI 처리
    if (agreed) goTo("translator");
  };

  // ── 회원가입 폼의 지역/직종 커스텀 셀렉트 (순수 UI) ────────────
  function buildCsel(wrapperId, menuId, options) {
    const wrap = $(wrapperId);
    const menu = $(menuId);
    const btn  = wrap.querySelector(".csel-btn");
    const val  = wrap.querySelector(".csel-val");

    options.forEach(opt => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "csel-option"; b.textContent = opt;
      b.onclick = () => {
        val.textContent = opt; btn.classList.add("has-value"); closeCsels();
        menu.querySelectorAll(".csel-option").forEach(o => o.classList.toggle("selected", o.textContent === opt));
        if (wrapperId === "csel-region") region = opt;
        if (wrapperId === "csel-job")    job    = opt;
      };
      menu.appendChild(b);
    });

    btn.onclick = () => {
      const was = menu.classList.contains("open"); closeCsels();
      if (!was) { menu.classList.add("open"); btn.classList.add("open"); }
    };
  }

  function closeCsels() {
    $$(".csel-menu").forEach(m => m.classList.remove("open"));
    $$(".csel-btn").forEach(b => b.classList.remove("open"));
  }

  root.addEventListener("click", e => { if (!e.target.closest(".csel")) closeCsels(); });

  // ── 약관 동의 체크박스 (순수 UI) ───────────────────────────────
  $("check-wrap").onclick = () => {
    agreed = !agreed;
    $("check-box").classList.toggle("on", agreed);
    $("check-box").innerHTML = agreed
      ? `<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : "";
    $("signup-btn").disabled = !agreed;
  };

  const toggleTerms = (e) => { e.stopPropagation(); $("terms-box").classList.toggle("open"); };
  $("terms-toggle-a").onclick = toggleTerms;
  $("pp-toggle-a").onclick    = toggleTerms;

  // ── 번역기 상단/모바일 필터용 지역·직종 셀렉트 (순수 UI) ───────
  function buildNsel(id, opts) {
    const sel = $(id);
    opts.forEach(o => { const el = document.createElement("option"); el.value = el.textContent = o; sel.appendChild(el); });
    sel.onchange = () => {
      const isRegion = id.includes("region");
      if (isRegion) { region = sel.value; $(id.startsWith("h-") ? "m-region" : "h-region").value = sel.value; }
      else          { job    = sel.value; $(id.startsWith("h-") ? "m-job"    : "h-job").value    = sel.value; }
      sel.classList.toggle("hv", !!sel.value);
      // TODO(backend): 변경된 지역/직종 값을 사용자 프로필에 저장하고 싶다면 여기서 API 호출
    };
  }

  // ── 프로필 드롭다운 (순수 UI) ─────────────────────────────────
  function setProfOpen(open) {
    $("prof-dropdown").classList.toggle("open", open);
    $("prof-btn").classList.toggle("open",   open);
    $("prof-btn").classList.toggle("closed", !open);
  }

  $("prof-btn").onclick = () => setProfOpen(!$("prof-dropdown").classList.contains("open"));
  root.addEventListener("click", e => { if (!e.target.closest(".prof-wrap")) setProfOpen(false); });
  $("logout-btn").onclick = () => {
    // TODO(backend): 로그아웃 처리 (세션/토큰 만료 등)
    setProfOpen(false);
    goTo("login");
  };

  // ── 채팅 메시지 렌더링 (화면 표시 담당, 데이터는 아래 TODO에서 채움) ──
  function makeBubble(msg, loading = false) {
    const row  = document.createElement("div"); row.className = "msg-row " + msg.role;
    const av   = document.createElement("div"); av.className  = "msg-av "  + msg.role; av.textContent = msg.role === "bot" ? "🤖" : "👤";
    const body = document.createElement("div"); body.className = "msg-body";

    if (msg.role === "bot") {
      const s = document.createElement("div"); s.className = "msg-sender"; s.textContent = "말랑"; body.appendChild(s);
    }

    const bubble = document.createElement("div"); bubble.className = "msg-bubble " + msg.role;
    if (loading) bubble.innerHTML = `<div class="dot-row"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
    else         bubble.textContent = msg.text;

    body.appendChild(bubble); row.appendChild(av); row.appendChild(body);
    return { row, bubble };
  }

  function renderChat() {
    $("chat-inner").innerHTML = "";
    curMsgs.forEach(m => $("chat-inner").appendChild(makeBubble(m).row));
    scrollBottom(); updateChips();
  }

  function scrollBottom() { const a = $("chat-area"); a.scrollTop = a.scrollHeight; }

  function updateChips() {
    $("chip-row").style.display = curMsgs.some(m => m.role === "user") ? "none" : "flex";
  }

  function sendMsg() {
    const ta   = $("chat-ta");
    const text = ta.value.trim(); if (!text) return;
    ta.value = ""; ta.style.height = "auto";
    $("send-btn").disabled = true;

    const userM = { role: "user", text };
    const botM  = { role: "bot",  text: "" };
    curMsgs.push(userM, botM);

    $("chat-inner").appendChild(makeBubble(userM).row);
    const { row: botRow, bubble: botBubble } = makeBubble(botM, true);
    $("chat-inner").appendChild(botRow);
    scrollBottom(); updateChips();

    // TODO(backend): 여기서 실제 번역 API를 호출하세요.
    //   요청: { text, region, job }
    //   응답: { translatedText }
    // TODO(frontend): API 호출 실패 시 에러 상태(재시도 버튼 등) 처리
    // TODO(backend): 이 대화를 서버에 저장하고, 새 대화라면 목록(convList)에 추가
    //
    // 아래는 자리만 차지하는 더미 처리입니다 — 실제 API 응답으로 교체해 주세요.
    // ------------------------------------------------------------------
    // fetchTranslation(text, { region, job }).then(result => {
    //   botBubble.innerHTML = "";
    //   botBubble.textContent = result.translatedText;
    //   botM.text = result.translatedText;
    //   renderConvList();
    //   scrollBottom();
    // });
    // ------------------------------------------------------------------
  }

  $("chat-ta").oninput = () => {
    const ta = $("chat-ta");
    ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    $("send-btn").disabled = !ta.value.trim();
  };
  $("chat-ta").onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } };
  $("send-btn").onclick = sendMsg;

  // 추천 질문 칩 클릭 시 입력창에 채워주기 (순수 UI)
  $$(".chip").forEach(chip => {
    chip.onclick = () => {
      const ta = $("chat-ta");
      ta.value = chip.textContent || ""; ta.dispatchEvent(new Event("input")); ta.focus();
    };
  });

  $("new-chat-btn").onclick = () => {
    curConvId = null;
    curMsgs = [{ role: "bot", text: WELCOME }];
    renderChat();
    // TODO(backend): 새 대화 시작을 서버에 알릴 필요가 있다면 여기서 처리
  };

  // ── 좌측/프로필 안의 최근 대화 목록 (순수 UI 렌더링) ───────────
  function renderConvList() {
    const list = $("conv-list"); list.innerHTML = "";
    if (!convList.length) { list.innerHTML = `<p class="pd-empty">아직 대화 기록이 없습니다.</p>`; return; }
    convList.forEach(c => {
      const btn = document.createElement("button"); btn.className = "pd-conv-btn";
      btn.innerHTML = `<span class="pd-conv-icon">💬</span><span class="pd-conv-title">${c.title}</span>`;
      btn.onclick = () => {
        // TODO(backend): 선택한 대화(c.id)의 전체 메시지 내역을 서버에서 불러오기
        curConvId = c.id;
        curMsgs = c.msgs && c.msgs.length ? c.msgs : [{ role: "bot", text: WELCOME }];
        renderChat(); setProfOpen(false);
      };
      list.appendChild(btn);
    });
  }

  // ── 초기 실행 ─────────────────────────────────────────────
  buildCsel("csel-region", "csel-region-menu", REGIONS);
  buildCsel("csel-job",    "csel-job-menu",    JOBS);
  buildNsel("h-region", REGIONS); buildNsel("m-region", REGIONS);
  buildNsel("h-job",    JOBS);    buildNsel("m-job",    JOBS);
  renderChat(); renderConvList();

  const upd = () => {
    $("t-brand").style.display  = window.innerWidth >= 640 ? "block" : "none";
    $("nc-label").style.display = window.innerWidth >= 640 ? "inline" : "none";
  };
  window.addEventListener("resize", upd); upd();
});
