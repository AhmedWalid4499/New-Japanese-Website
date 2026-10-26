// Sakura Study app — shared helpers: state, sound effects, speech.
// Everything hangs off the global `A` namespace. Progress is kept separately from the website.
window.A = window.A || {};

(function (A) {
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  A.esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
  A.$ = (s, r = document) => r.querySelector(s);
  A.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  A.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  A.sample = (arr, n) => A.shuffle(arr).slice(0, n);
  A.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  A.uniq = (arr) => Array.from(new Set(arr));
  A.dayKey = (d = Date.now()) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  A.chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };

  // ── State (one object in localStorage, separate from the website's data) ──
  const KEY = 'sakura_app_state';
  const MAX_HEARTS = 5, HEART_MS = 30 * 60 * 1000;
  const fresh = () => ({
    profile: { name: '', created: Date.now(), goal: 20, sound: true, romaji: true, rate: 0.85, onboarded: false },
    xp: 0, daily: {}, streak: { n: 0, last: '', best: 0, freezes: 0 },
    hearts: { n: MAX_HEARTS, at: Date.now() },
    lessons: {},   // 'unitId:index' → { done, best }
    srs: {},       // itemId → { box, due, seen, wrong }
    achievements: {},
  });
  let state;
  try { state = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { state = fresh(); }
  state.profile = { ...fresh().profile, ...state.profile };
  A.state = state;
  A.save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  A.resetAll = () => { localStorage.removeItem(KEY); location.reload(); };

  // Hearts refill one every 30 minutes
  A.hearts = () => {
    const h = state.hearts;
    if (h.n < MAX_HEARTS) {
      const gained = Math.floor((Date.now() - h.at) / HEART_MS);
      if (gained > 0) { h.n = Math.min(MAX_HEARTS, h.n + gained); h.at = h.n >= MAX_HEARTS ? Date.now() : h.at + gained * HEART_MS; A.save(); }
    } else h.at = Date.now();
    return h.n;
  };
  A.MAX_HEARTS = MAX_HEARTS;
  A.nextHeartIn = () => Math.max(0, HEART_MS - (Date.now() - state.hearts.at));
  A.loseHeart = () => { A.hearts(); if (state.hearts.n === MAX_HEARTS) state.hearts.at = Date.now(); state.hearts.n = Math.max(0, state.hearts.n - 1); A.save(); };
  A.gainHeart = (n = 1) => { state.hearts.n = Math.min(MAX_HEARTS, A.hearts() + n); A.save(); };

  // XP, daily goal and streak
  A.todayXp = () => state.daily[A.dayKey()] || 0;
  A.addXp = (n) => {
    const t = A.dayKey();
    state.xp += n;
    state.daily[t] = (state.daily[t] || 0) + n;
    const last = state.streak.last;
    const extended = last !== t;
    if (extended) {
      const yesterday = A.dayKey(Date.now() - 86400000);
      state.streak.n = last === yesterday ? state.streak.n + 1 : 1;
      state.streak.last = t;
      state.streak.best = Math.max(state.streak.best, state.streak.n);
    }
    A.save();
    return extended;
  };
  A.streak = () => {
    const s = state.streak;
    const alive = s.last === A.dayKey() || s.last === A.dayKey(Date.now() - 86400000);
    return { n: alive ? s.n : 0, today: s.last === A.dayKey(), best: s.best };
  };

  // Spaced repetition for every item the learner has met
  const DAYS = [0, 1, 2, 4, 8, 16, 32];
  A.srsMark = (id, ok) => {
    const c = state.srs[id] || { box: 0, due: 0, seen: 0, wrong: 0 };
    c.seen++;
    if (ok) { c.box = Math.min(DAYS.length - 1, c.box + 1); c.due = Date.now() + DAYS[c.box] * 86400000; }
    else { c.box = 0; c.wrong++; c.due = Date.now(); c.lastWrong = Date.now(); }
    state.srs[id] = c;
  };
  A.dueItems = () => Object.entries(state.srs).filter(([, c]) => c.due <= Date.now()).map(([id]) => id);
  A.mistakeItems = () => Object.entries(state.srs).filter(([, c]) => c.lastWrong && c.box < 2).sort((a, b) => b[1].lastWrong - a[1].lastWrong).map(([id]) => id);
  A.learnedCount = () => Object.keys(state.srs).length;

  // ── Sound effects (synthesised, no files) ──
  let ctx = null;
  const audio = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  const tone = (f, t0, dur, type = 'sine', gain = 0.12) => {
    const c = audio(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  A.sfx = (kind) => {
    if (!state.profile.sound) return;
    try {
      // Japanese "in" pentatonic: D E♭ G A B♭ — plucked like a koto
      if (kind === 'correct') { tone(784, 0, 0.5, 'triangle', 0.12); tone(1175, 0.08, 0.7, 'sine', 0.08); }
      else if (kind === 'wrong') { tone(311, 0, 0.35, 'sine', 0.1); tone(294, 0.12, 0.5, 'sine', 0.08); }
      else if (kind === 'tap') tone(1175, 0, 0.08, 'sine', 0.04);
      else if (kind === 'match') tone(880 + Math.random() * 200, 0, 0.3, 'triangle', 0.07);
      else if (kind === 'complete') [587, 622, 784, 880, 932, 1175].forEach((f, i) => tone(f, i * 0.12, 0.9, 'triangle', 0.08));
    } catch (e) {}
  };

  // ── Japanese speech (iOS has high-quality built-in Japanese voices) ──
  const synth = window.speechSynthesis;
  let voice = null;
  const pickVoice = () => {
    if (!synth) return;
    const vs = synth.getVoices().filter((v) => /^ja/i.test(v.lang));
    voice = vs.find((v) => /kyoko|otoya|o-ren|hattori|google|nanami/i.test(v.name)) || vs[0] || null;
  };
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
  A.speak = (text, slow) => {
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/_{2,}/g, '、').replace(/[()（）]/g, ''));
    u.lang = 'ja-JP';
    u.rate = slow ? 0.5 : state.profile.rate;
    if (voice) u.voice = voice;
    synth.speak(u);
  };

  // ── Small UI helpers ──
  A.toast = (msg) => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
  };
  A.sheet = (html, { onClose } = {}) => {
    const ov = document.createElement('div');
    ov.className = 'sheet-overlay';
    ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-grip"></div>${html}</div>`;
    const close = () => { ov.classList.remove('open'); setTimeout(() => ov.remove(), 250); onClose && onClose(); };
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-close]')) close(); });
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('open'));
    return { el: A.$('.sheet', ov), close };
  };
  A.confetti = () => {
    const cv = document.createElement('canvas');
    cv.className = 'confetti';
    document.body.appendChild(cv);
    const c = cv.getContext('2d');
    cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
    c.scale(devicePixelRatio, devicePixelRatio);
    const cols = ['#ff5e8e', '#ffc800', '#58cc02', '#1cb0f6', '#ce82ff', '#ff9600'];
    const ps = Array.from({ length: 120 }, () => ({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.4, vx: Math.random() * 2 - 1, vy: 2 + Math.random() * 3, r: 5 + Math.random() * 5, c: A.pick(cols), a: Math.random() * 6 }));
    const end = Date.now() + 2600;
    (function f() {
      c.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach((p) => { p.x += p.vx; p.y += p.vy; p.a += 0.1; c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = p.c; c.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); c.restore(); });
      if (Date.now() < end) requestAnimationFrame(f); else cv.remove();
    })();
  };

  // Me3temed the owl — the app's mascot
  A.owl = (cls = '') => `<svg class="owl ${cls}" viewBox="0 0 120 130" aria-hidden="true"><ellipse cx="60" cy="125" rx="22" ry="4" fill="#0002"/><ellipse cx="60" cy="88" rx="30" ry="28" fill="#4a6741"/><ellipse cx="60" cy="92" rx="19" ry="20" fill="#f0e8c8"/><path d="M51 84 Q60 78 69 84 Q60 90 51 84Z" fill="#b8a060" opacity=".7"/><ellipse class="wing-l" cx="30" cy="90" rx="10" ry="16" fill="#3a5332" transform="rotate(10 30 90)"/><ellipse class="wing-r" cx="90" cy="90" rx="10" ry="16" fill="#3a5332" transform="rotate(-10 90 90)"/><circle cx="60" cy="55" r="30" fill="#4a6741"/><ellipse cx="60" cy="58" rx="23" ry="22" fill="#f0e8c8"/><circle cx="49" cy="54" r="11" fill="#1c1c2e"/><circle cx="49" cy="54" r="8.5" fill="#3a7a68"/><circle cx="49" cy="54" r="5" fill="#1c1c2e"/><circle cx="46.5" cy="51.5" r="2.2" fill="#fff"/><circle cx="71" cy="54" r="11" fill="#1c1c2e"/><circle cx="71" cy="54" r="8.5" fill="#3a7a68"/><circle cx="71" cy="54" r="5" fill="#1c1c2e"/><circle cx="68.5" cy="51.5" r="2.2" fill="#fff"/><path d="M56 63 Q60 69 64 63 Q62 67 60 68 Q58 67 56 63Z" fill="#c8a040"/><ellipse cx="44" cy="28" rx="7" ry="11" fill="#3a5332" transform="rotate(-20 44 28)"/><ellipse cx="76" cy="28" rx="7" ry="11" fill="#3a5332" transform="rotate(20 76 28)"/><polygon points="42,75 56,80 56,70" fill="#f0306a"/><polygon points="78,75 64,80 64,70" fill="#f0306a"/><circle cx="60" cy="75" r="5.5" fill="#c01050"/><path d="M50 113l-7 9M50 113v10M50 113l7 9M70 113l-7 9M70 113v10M70 113l7 9" stroke="#c8a040" stroke-width="3.5" stroke-linecap="round"/></svg>`;

  // Icons (24×24, stroke)
  const IC = {
    home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    dumbbell: '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    // a sakura petal (lives) and a paper lantern (streak)
    heart: '<path d="M12 22c-4.6-2.3-7.5-6.4-7.5-10.6A5.2 5.2 0 0 1 9.6 6L12 8.3 14.4 6a5.2 5.2 0 0 1 5.1 5.4C19.5 15.6 16.6 19.7 12 22z" fill="currentColor"/>',
    flame: '<path d="M9 2.5h6M12 2.5V5M9.5 21.5h5M12 19v2.5"/><rect x="5.5" y="5" width="13" height="14" rx="6.5" fill="currentColor"/><path d="M6.5 9.5h11M6 14.5h12" stroke="#0003"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    turtle: '<path d="M4 15c0-4 3.6-7 8-7s8 3 8 7H4z" fill="currentColor"/><path d="M6 15v3M18 15v3M20 13h2"/>',
    share: '<path d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 14v4M8 21h8"/>',
  };
  A.icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
})(window.A);
