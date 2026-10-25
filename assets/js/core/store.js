// Local persistence for everything the learner does.
// Keys keep their original names so progress saved by the old site carries over.
(function (S) {
  const KEYS = {
    scores: 'sakura_scores',      // [{type, score, total, pct, date}]
    srs: 'sakura_srs',            // {area: {itemId: {status:'known'|'review', date}}}
    bm: 'sakura_bm',              // {itemId: {type, label, detail, char, date}}
    streak: 'sakura_streak',      // {streak, lastDate, best}
    cards: 'sakura_cards',        // {cardId: {box, due, last}}
    activity: 'sakura_activity',  // {'YYYY-MM-DD': count}
    settings: 'sakura_settings',  // {theme, ttsRate, dailyGoal, ...}
    plan: 'sakura_plan',          // {'week-task': true}
    dict: 'sakura_dict_history',  // ['word', ...]
  };
  const CUSTOM_TYPES = ['vocab', 'kanji', 'grammar', 'adj', 'counters'];
  const customKey = (t) => `sakura_custom_${t}`;

  const listeners = new Set();
  const read = (key, fallback) => {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  };
  const write = (key, val, silent) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage full or blocked */ }
    if (!silent) listeners.forEach((fn) => fn(key));
  };

  const store = {
    KEYS, CUSTOM_TYPES, read, write,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };

  // ── Settings ──
  const DEFAULT_SETTINGS = { theme: 'auto', ttsRate: 0.85, dailyGoal: 20, romaji: true };
  store.settings = {
    all: () => ({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) }),
    get: (k) => store.settings.all()[k],
    set(k, v) { write(KEYS.settings, { ...store.settings.all(), [k]: v }); },
  };
  // migrate the old dark-mode flag once
  try {
    const legacyDark = localStorage.getItem('sakura_dark');
    if (legacyDark != null && !read(KEYS.settings, {}).theme) {
      store.settings.set('theme', legacyDark === '1' ? 'dark' : 'light');
      localStorage.removeItem('sakura_dark');
    }
  } catch (e) {}

  // ── Activity & streak ──
  store.activity = {
    map: () => read(KEYS.activity, {}),
    today: () => store.activity.map()[S.today()] || 0,
    log(n = 1) {
      const m = store.activity.map();
      const t = S.today();
      m[t] = (m[t] || 0) + n;
      write(KEYS.activity, m);
      const s = read(KEYS.streak, { streak: 0, lastDate: '' });
      const last = s.lastDate ? S.dayKey(s.lastDate) : '';
      if (last !== t) {
        const yesterday = S.dayKey(Date.now() - 86400000);
        s.streak = last === yesterday ? (s.streak || 0) + 1 : 1;
        s.lastDate = new Date().toISOString();
        s.best = Math.max(s.best || 0, s.streak);
        write(KEYS.streak, s);
      }
    },
  };
  store.streak = () => {
    const s = read(KEYS.streak, { streak: 0, lastDate: '' });
    const last = s.lastDate ? S.dayKey(s.lastDate) : '';
    const alive = last === S.today() || last === S.dayKey(Date.now() - 86400000);
    return { current: alive ? s.streak || 0 : 0, best: Math.max(s.best || 0, s.streak || 0), studiedToday: last === S.today() };
  };

  // ── Quiz scores ──
  store.scores = {
    list: () => read(KEYS.scores, []),
    // ref optionally identifies the exact passage/deck, e.g. for "best score on this passage"
    add(type, score, total, ref) {
      const h = store.scores.list();
      h.unshift({ type, score, total, pct: S.pct(score, total), date: new Date().toISOString(), ...(ref ? { ref } : {}) });
      write(KEYS.scores, h.slice(0, 200));
      store.activity.log(total);
    },
    clear() { write(KEYS.scores, []); },
  };

  // ── "Know it / Review" marks ──
  store.srs = {
    all: () => read(KEYS.srs, {}),
    get: (area, id) => (store.srs.all()[area] || {})[id]?.status || null,
    set(area, id, status) {
      const d = store.srs.all();
      d[area] = d[area] || {};
      if (d[area][id]?.status === status) delete d[area][id];
      else { d[area][id] = { status, date: new Date().toISOString() }; store.activity.log(1); }
      write(KEYS.srs, d);
      return d[area][id]?.status || null;
    },
    count: (area, status) => Object.values(store.srs.all()[area] || {}).filter((x) => x.status === status).length,
  };

  // ── Bookmarks ──
  store.bm = {
    all: () => read(KEYS.bm, {}),
    has: (id) => !!store.bm.all()[id],
    toggle(id, meta) {
      const b = store.bm.all();
      if (b[id]) delete b[id];
      else b[id] = { ...meta, date: new Date().toISOString() };
      write(KEYS.bm, b);
      return !!b[id];
    },
    remove(id) { const b = store.bm.all(); delete b[id]; write(KEYS.bm, b); },
  };

  // ── Custom entries ──
  store.custom = {
    list: (type) => read(customKey(type), []),
    add(type, entry) { write(customKey(type), [...store.custom.list(type), { ...entry, _custom: true }]); },
    remove(type, idx) { const d = store.custom.list(type); d.splice(idx, 1); write(customKey(type), d); },
  };

  // ── Flashcard spaced repetition (Leitner boxes) ──
  const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16, 32];
  const DAY = 86400000;
  store.cards = {
    INTERVAL_DAYS,
    all: () => read(KEYS.cards, {}),
    get: (id) => store.cards.all()[id] || null,
    isDue: (id, all = store.cards.all()) => { const c = all[id]; return !c || c.due <= Date.now(); },
    isNew: (id, all = store.cards.all()) => !all[id],
    // grade: 0 = again, 1 = good, 2 = easy
    rate(id, grade) {
      const all = store.cards.all();
      const c = all[id] || { box: 0 };
      if (grade === 0) { c.box = 0; c.due = Date.now() + 60 * 1000; }
      else {
        c.box = Math.min(INTERVAL_DAYS.length - 1, (c.box || 0) + grade);
        c.due = Date.now() + INTERVAL_DAYS[c.box] * DAY - 60 * 60 * 1000;
      }
      c.last = Date.now();
      all[id] = c;
      write(KEYS.cards, all);
      store.activity.log(1);
      return c;
    },
    mastered: (ids, all = store.cards.all()) => ids.filter((id) => (all[id]?.box || 0) >= 4).length,
    learning: (ids, all = store.cards.all()) => ids.filter((id) => all[id] && (all[id].box || 0) < 4).length,
  };

  // ── Study plan checklist ──
  store.plan = {
    all: () => read(KEYS.plan, {}),
    toggle(key) { const p = store.plan.all(); p[key] = !p[key]; if (!p[key]) delete p[key]; write(KEYS.plan, p); if (p[key]) store.activity.log(1); return !!p[key]; },
  };

  // ── Dictionary history ──
  store.dict = {
    list: () => read(KEYS.dict, []),
    push(q) { write(KEYS.dict, [q, ...store.dict.list().filter((x) => x !== q)].slice(0, 12)); },
    clear() { write(KEYS.dict, []); },
  };

  // ── Snapshot / merge (backups + cloud sync) ──
  store.snapshot = () => {
    const out = {};
    for (const [name, key] of Object.entries(KEYS)) out[name] = read(key, null);
    out.custom = {};
    CUSTOM_TYPES.forEach((t) => { out.custom[t] = store.custom.list(t); });
    return out;
  };

  const newer = (a, b) => (new Date(a?.date || a?.lastDate || a?.last || 0) >= new Date(b?.date || b?.lastDate || b?.last || 0) ? a : b);
  const unionBy = (a = [], b = [], keyFn) => {
    const seen = new Map();
    [...a, ...b].forEach((x) => { const k = keyFn(x); if (!seen.has(k)) seen.set(k, x); });
    return [...seen.values()];
  };

  // Merge remote data into local without losing anything from either side.
  store.merge = (remote, { replace = false } = {}) => {
    if (!remote) return;
    const local = replace ? {} : store.snapshot();
    const out = {};
    out.scores = unionBy(remote.scores || [], local.scores || [], (s) => `${s.type}|${s.date}`)
      .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 200);
    out.srs = { ...(local.srs || {}) };
    Object.entries(remote.srs || {}).forEach(([area, items]) => {
      out.srs[area] = { ...(out.srs[area] || {}) };
      Object.entries(items || {}).forEach(([id, v]) => { out.srs[area][id] = out.srs[area][id] ? newer(v, out.srs[area][id]) : v; });
    });
    out.bm = { ...(remote.bm || {}), ...(local.bm || {}) };
    const rs = remote.streak || {}, ls = local.streak || {};
    out.streak = { ...newer(rs, ls), best: Math.max(rs.best || 0, ls.best || 0, rs.streak || 0, ls.streak || 0) };
    out.cards = { ...(remote.cards || {}) };
    Object.entries(local.cards || {}).forEach(([id, c]) => { out.cards[id] = out.cards[id] && (out.cards[id].last || 0) > (c.last || 0) ? out.cards[id] : c; });
    out.activity = { ...(remote.activity || {}) };
    Object.entries(local.activity || {}).forEach(([d, n]) => { out.activity[d] = Math.max(out.activity[d] || 0, n); });
    out.settings = { ...(remote.settings || {}), ...(local.settings || {}) };
    out.plan = { ...(remote.plan || {}), ...(local.plan || {}) };
    out.dict = S.uniq([...(local.dict || []), ...(remote.dict || [])]).slice(0, 12);
    for (const [name, key] of Object.entries(KEYS)) if (out[name] != null) write(key, out[name], true);
    CUSTOM_TYPES.forEach((t) => {
      const merged = unionBy((local.custom || {})[t] || [], (remote.custom || {})[t] || [], (x) => JSON.stringify(x));
      write(customKey(t), merged, true);
    });
    listeners.forEach((fn) => fn('*'));
  };

  store.reset = () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    CUSTOM_TYPES.forEach((t) => localStorage.removeItem(customKey(t)));
    listeners.forEach((fn) => fn('*'));
  };

  S.store = store;
})(window.S);
