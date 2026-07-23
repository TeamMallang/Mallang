const REGIONS = ["서울","부산","대구","인천","광주","대전","울산","경기","강원","충북","충남","전북","전남","경북","경남","제주"];
const JOBS    = ["IT / 개발","마케팅 / 홍보","영업 / 영업관리","인사 / 총무","회계 / 재무","디자인 / 크리에이티브","제조 / 생산","의료 / 제약","교육 / 강사","법률 / 법무","건설 / 시공","유통 / 물류"];
const TR = {
  "이거 왜 저한테 시키는 거예요?": "해당 업무를 제가 담당하게 된 배경을 여쭤봐도 될까요? 더 잘 이해하고 효율적으로 진행하고 싶어서요.",
  "그 일은 제 담당이 아닌데요":    "현재 제 주요 업무 범위 외의 사안인 것 같습니다. 혹시 업무 분장 차원에서 제가 지원할 수 있는 부분이 있다면 말씀해 주시면 검토해 보겠습니다.",
  "오늘 일찍 퇴근해도 되나요?":    "오늘 처리해야 할 업무를 모두 마무리하였는데, 혹시 선결해야 할 다른 사안이 없다면 조기 퇴근이 가능한지 여쭤봐도 될까요?",
  "그 회의 꼭 참석해야 하나요?":   "해당 회의에 제가 기여할 수 있는 부분이 있을지 확인하고 싶습니다. 참석이 꼭 필요한지 여쭤봐도 될까요?",
};
const WELCOME = "안녕하세요! 저는 말랑이에요 😊\n\n\"그 말, 말랑하게 다시 해볼까요?\"\n\n하고 싶은 말을 솔직하게 입력하면, 직장에서 통하는 부드러운 언어로 바꿔드릴게요.\n\n근무 지역과 직종을 설정하면 더 딱 맞는 번역을 해드릴 수 있어요!";

/* ── 테마 ── */
function applyTheme(dark) {
  dark ? document.body.classList.add('dark') : document.body.classList.remove('dark');
  localStorage.setItem('mallang-theme', dark ? 'dark' : 'light');
  const bl = document.getElementById('btn-light');
  const bd = document.getElementById('btn-dark');
  if (bl) bl.classList.toggle('on', !dark);
  if (bd) bd.classList.toggle('on',  dark);
}

function initTheme() {
  applyTheme(localStorage.getItem('mallang-theme') === 'dark');
}

/* ── 말랑 바운스 ── */
function mallang(el) {
  if (!el || el.disabled) return;
  el.classList.remove('bounce');
  void el.offsetWidth;
  el.classList.add('bounce');
  el.addEventListener('animationend', () => el.classList.remove('bounce'), { once: true });
}

function initBounce() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (btn && !btn.disabled) mallang(btn);
  });
}

/* ── 커스텀 셀렉트 (회원가입) ── */
function buildCsel(btnId, valId, menuId, opts) {
  const btn  = document.getElementById(btnId);
  const val  = document.getElementById(valId);
  const menu = document.getElementById(menuId);
  if (!btn || !val || !menu) return;
  opts.forEach(o => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'csel-opt'; b.textContent = o;
    b.addEventListener('click', () => {
      val.textContent = o;
      btn.classList.add('val');
      closeAllCsels();
      menu.querySelectorAll('.csel-opt').forEach(x => x.classList.toggle('sel', x.textContent === o));
    });
    menu.appendChild(b);
  });
  btn.addEventListener('click', () => {
    const wasOpen = menu.classList.contains('open');
    closeAllCsels();
    if (!wasOpen) { menu.classList.add('open'); btn.classList.add('open'); }
  });
}

function closeAllCsels() {
  document.querySelectorAll('.csel-menu').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.csel-btn').forEach(b => b.classList.remove('open'));
}

function initCsels() {
  buildCsel('csel-region-btn', 'csel-region-val', 'csel-region-menu', REGIONS);
  buildCsel('csel-job-btn',    'csel-job-val',    'csel-job-menu',    JOBS);
  document.addEventListener('click', e => {
    if (!e.target.closest('.csel')) closeAllCsels();
  });
}

/* ── 네이티브 셀렉트 (번역기 헤더) ── */
function fillSelect(id, opts, syncId, stateSetter) {
  const sel = document.getElementById(id);
  if (!sel) return;
  opts.forEach(o => {
    const el = document.createElement('option');
    el.value = el.textContent = o;
    sel.appendChild(el);
  });
  sel.addEventListener('change', () => {
    sel.classList.toggle('hv', !!sel.value);
    stateSetter(sel.value);
    const sync = document.getElementById(syncId);
    if (sync) sync.value = sel.value;
  });
}

/* ── 약관 체크박스 ── */
function initTerms() {
  let agreed = false;
  const wrap = document.getElementById('chk-wrap');
  const box  = document.getElementById('chk-box');
  const btn  = document.getElementById('btn-signup');
  if (!wrap || !box || !btn) return;
  wrap.addEventListener('click', () => {
    agreed = !agreed;
    box.classList.toggle('on', agreed);
    box.innerHTML = agreed
      ? '<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '';
    btn.disabled = !agreed;
  });
  const toggleTerms = e => { e.stopPropagation(); document.getElementById('terms-box').classList.toggle('open'); };
  const at = document.getElementById('a-terms');
  const ap = document.getElementById('a-pp');
  if (at) at.addEventListener('click', toggleTerms);
  if (ap) ap.addEventListener('click', toggleTerms);
}

/* ── 프로필 드롭다운 ── */
function setPD(open) {
  const dd = document.getElementById('prof-dd');
  const pb = document.getElementById('prof-btn');
  if (!dd || !pb) return;
  dd.classList.toggle('open', open);
  pb.classList.toggle('op',   open);
  pb.classList.toggle('cl',  !open);
}

function initProfileDropdown() {
  const pb = document.getElementById('prof-btn');
  if (!pb) return;
  pb.addEventListener('click', () => {
    setPD(!document.getElementById('prof-dd').classList.contains('open'));
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.prof-wrap')) setPD(false);
  });
  const logout = document.getElementById('btn-logout');
  if (logout) logout.addEventListener('click', () => { setPD(false); location.href = 'login.html'; });
  const bl = document.getElementById('btn-light');
  const bd = document.getElementById('btn-dark');
  if (bl) bl.addEventListener('click', () => applyTheme(false));
  if (bd) bd.addEventListener('click', () => applyTheme(true));
}

/* ── 채팅 ── */
let region = '', job = '';
let curMsgs = [{ role: 'bot', text: WELCOME }];
let convs = [
  { id:-1, title:"이거 왜 저한테 시키는 거예요?", msgs:[{role:'bot',text:WELCOME},{role:'user',text:"이거 왜 저한테 시키는 거예요?"},{role:'bot',text:TR["이거 왜 저한테 시키는 거예요?"]}] },
  { id:-2, title:"오늘 일찍 퇴근해도 되나요?",    msgs:[{role:'bot',text:WELCOME},{role:'user',text:"오늘 일찍 퇴근해도 되나요?"  },{role:'bot',text:TR["오늘 일찍 퇴근해도 되나요?"   ]}] },
  { id:-3, title:"그 회의 꼭 참석해야 하나요?",   msgs:[{role:'bot',text:WELCOME},{role:'user',text:"그 회의 꼭 참석해야 하나요?"},{role:'bot',text:TR["그 회의 꼭 참석해야 하나요?" ]}] },
];
let convIdCtr = 1, curConvId = null;

function translate(text) {
  const base = TR[text.trim()] || `"${text.trim()}"에 대해 조금 더 맥락을 알 수 있을까요? 보다 효율적으로 업무를 진행하고 싶어서요.`;
  return base + ((region || job) ? ` (${[region, job].filter(Boolean).join(' · ')} 기반)` : '');
}

function makeBubble(msg, loading) {
  const row = document.createElement('div');
  row.className = 'msg-row ' + msg.role;
  const av = document.createElement('div');
  av.className = 'msg-av ' + msg.role;
  av.innerHTML = msg.role === 'bot' ? '<img src="logo.png" alt="말랑">' : '👤';
  const body = document.createElement('div');
  body.className = 'msg-body';
  if (msg.role === 'bot') {
    const from = document.createElement('div');
    from.className = 'msg-from';
    from.textContent = '말랑';
    body.appendChild(from);
  }
  const bbl = document.createElement('div');
  bbl.className = 'bubble ' + msg.role;
  if (loading) {
    bbl.innerHTML = '<div class="dot-row"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
  } else {
    bbl.textContent = msg.text;
  }
  body.appendChild(bbl);
  row.appendChild(av);
  row.appendChild(body);
  return { row, bbl };
}

function scrollDown() {
  const a = document.getElementById('chat-area');
  if (a) a.scrollTop = a.scrollHeight;
}

function updateChips() {
  const cr = document.getElementById('chip-row');
  if (cr) cr.style.display = curMsgs.some(m => m.role === 'user') ? 'none' : 'flex';
}

function renderChat() {
  const ci = document.getElementById('chat-inner');
  if (!ci) return;
  ci.innerHTML = '';
  curMsgs.forEach(m => ci.appendChild(makeBubble(m, false).row));
  scrollDown();
  updateChips();
}

function renderConvs() {
  const list = document.getElementById('conv-list');
  if (!list) return;
  list.innerHTML = '';
  if (!convs.length) {
    list.innerHTML = '<p class="conv-empty">아직 대화 기록이 없습니다.</p>';
    return;
  }
  convs.forEach(c => {
    const b = document.createElement('button');
    b.className = 'conv-btn';
    b.innerHTML = '<span class="conv-ico">💬</span><span class="conv-ttl">' + c.title + '</span>';
    b.addEventListener('click', () => {
      curConvId = c.id;
      curMsgs = c.msgs.length ? [...c.msgs] : [{ role: 'bot', text: WELCOME }];
      renderChat();
      setPD(false);
    });
    list.appendChild(b);
  });
}

function send() {
  const ta  = document.getElementById('chat-ta');
  const txt = ta ? ta.value.trim() : '';
  if (!txt) return;
  ta.value = '';
  ta.style.height = 'auto';
  document.getElementById('btn-send').disabled = true;
  const isFirst = !curMsgs.some(m => m.role === 'user');
  const um = { role: 'user', text: txt };
  const bm = { role: 'bot',  text: '' };
  curMsgs.push(um, bm);
  const ci = document.getElementById('chat-inner');
  ci.appendChild(makeBubble(um, false).row);
  const { row: br, bbl: bb } = makeBubble(bm, true);
  ci.appendChild(br);
  scrollDown();
  updateChips();
  if (isFirst) {
    const id = convIdCtr++;
    curConvId = id;
    convs.unshift({ id, title: txt.length > 28 ? txt.slice(0, 28) + '…' : txt, msgs: [] });
  }
  setTimeout(() => {
    const out = translate(txt);
    bb.innerHTML = '';
    bb.textContent = out;
    bm.text = out;
    if (curConvId !== null) {
      const c = convs.find(c => c.id === curConvId);
      if (c) c.msgs = [...curMsgs];
    }
    renderConvs();
    scrollDown();
  }, 1400);
}

function initChat() {
  const ta = document.getElementById('chat-ta');
  if (!ta) return;
  ta.addEventListener('input', () => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    document.getElementById('btn-send').disabled = !ta.value.trim();
  });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  document.getElementById('btn-send').addEventListener('click', send);
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      ta.value = chip.textContent;
      ta.dispatchEvent(new Event('input'));
      ta.focus();
    });
  });
  const btnNew = document.getElementById('btn-new');
  if (btnNew) btnNew.addEventListener('click', () => {
    curConvId = null;
    curMsgs = [{ role: 'bot', text: WELCOME }];
    renderChat();
  });
  fillSelect('h-region', REGIONS, 'm-region', v => { region = v; });
  fillSelect('m-region', REGIONS, 'h-region', v => { region = v; });
  fillSelect('h-job',    JOBS,    'm-job',    v => { job = v; });
  fillSelect('m-job',    JOBS,    'h-job',    v => { job = v; });
}

function initResize() {
  function resize() {
    const nl = document.getElementById('nc-lbl');
    const w  = window.innerWidth >= 640;
    if (nl) nl.style.display = w ? 'inline' : 'none';
  }
  window.addEventListener('resize', resize);
  resize();
}
