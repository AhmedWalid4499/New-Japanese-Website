// Small shared helpers. Everything hangs off the global `S` namespace.
window.S = window.S || {};

(function (S) {
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  S.esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  S.$ = (sel, root = document) => root.querySelector(sel);
  S.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Fisher–Yates — unbiased, returns a new array
  S.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  S.sample = (arr, n) => S.shuffle(arr).slice(0, n);
  S.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  S.uniq = (arr) => Array.from(new Set(arr));

  S.debounce = (fn, ms = 250) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  S.today = () => S.dayKey(new Date());
  S.dayKey = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  };
  S.fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  S.fmtTime = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  S.pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
  // Page registry — each file in views/ calls S.view(name, { render(root, ctx) })
  S.views = {};
  S.view = (name, def) => { S.views[name] = def; };

  // Cleanup hooks (timers, key listeners) that run when the user leaves the current page
  const leaveFns = [];
  S.onLeave = (fn) => leaveFns.push(fn);
  S.runLeave = () => { while (leaveFns.length) { try { leaveFns.pop()(); } catch (e) { console.error(e); } } };

  S.slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9぀-ヿ一-鿿]+/g, '-').replace(/^-|-$/g, '');

  // ── Icons (24×24, stroke-based) ──
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor" stroke="none"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 10 4 4 0 0 1 18 18z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    cards: '<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  };
  S.icon = (name, cls = '') =>
    `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  // ── Toast ──
  S.toast = (msg, kind = '') => {
    let wrap = S.$('#toasts');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toasts';
      wrap.setAttribute('role', 'status');
      wrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(wrap);
    }
    const t = document.createElement('div');
    t.className = `toast ${kind}`;
    t.textContent = msg;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
  };

  // ── Modal ── returns { el, close }. `body` is an HTML string.
  S.modal = ({ title = '', body = '', wide = false, onClose } = {}) => {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${S.esc(title)}">
      <div class="modal-head"><h2>${S.esc(title)}</h2><button class="icon-btn" data-close aria-label="Close">${S.icon('x')}</button></div>
      <div class="modal-body">${body}</div></div>`;
    const prevFocus = document.activeElement;
    const close = () => {
      ov.classList.remove('open');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => ov.remove(), 200);
      onClose && onClose();
      prevFocus && prevFocus.focus && prevFocus.focus();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('open'));
    setTimeout(() => { const f = ov.querySelector('input,select,textarea,button:not([data-close])'); f && f.focus(); }, 60);
    return { el: ov.querySelector('.modal'), close };
  };

  S.confirm = (message) => window.confirm(message);

  // ── Confetti + celebration ──
  S.confetti = (duration = 2800) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas');
    cv.className = 'confetti';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    cv.width = innerWidth; cv.height = innerHeight;
    const colors = ['#e2557f', '#f59fb8', '#7c6cf2', '#3fb6d9', '#f2b84b', '#38b58a'];
    const ps = Array.from({ length: 150 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5,
      r: 4 + Math.random() * 6, vx: Math.random() * 2 - 1, vy: 2 + Math.random() * 3,
      c: S.pick(colors), rot: Math.random() * 360, vr: Math.random() * 6 - 3,
    }));
    const end = Date.now() + duration;
    (function draw() {
      const left = end - Date.now();
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalAlpha = Math.min(1, left / 500);
      ps.forEach((p) => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      });
      if (left > 0) requestAnimationFrame(draw); else cv.remove();
    })();
  };
})(window.S);
