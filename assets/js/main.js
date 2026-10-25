// App shell: navigation, hash router, theme, top bar. Loaded last.
(function (S) {
  const esc = S.esc;

  // ── Navigation (also feeds the search palette) ──
  S.NAV = [
    { group: '', items: [{ id: 'home', label: 'Home', glyph: '家', desc: 'Your study dashboard' }] },
    { group: 'Learn', items: [
      { id: 'kana', label: 'Kana', glyph: 'あ', desc: 'Hiragana & katakana charts' },
      { id: 'grammar', label: 'Grammar', glyph: '文', desc: `${GRAMMAR_SECTIONS.reduce((a, s) => a + s.items.length, 0)} N5 patterns with examples` },
      { id: 'kanji', label: 'Kanji', glyph: '漢', desc: `${KANJI.length} N5 kanji with stroke order` },
      { id: 'vocab', label: 'Vocabulary', glyph: '語', desc: `${VOCAB.length} words by topic` },
      { id: 'adjectives', label: 'Adjectives', glyph: '形', desc: 'い / な adjectives & opposites' },
      { id: 'counters', label: 'Counters', glyph: '個', desc: 'Counting words & irregular readings' },
      { id: 'numbers', label: 'Numbers & time', glyph: '数', desc: 'Numbers, time, dates and money' },
      { id: 'phrases', label: 'Survival phrases', glyph: '話', desc: 'Real-life phrases with audio' },
    ] },
    { group: 'Practice', items: [
      { id: 'tutor', label: 'AI tutor', glyph: '先', desc: 'Chat with a ChatGPT-powered teacher' },
      { id: 'review', label: 'Flashcards', glyph: '覚', desc: 'Spaced-repetition review' },
      { id: 'quiz', label: 'Quizzes', glyph: '問', desc: 'Kana, kanji, vocab & numbers' },
      { id: 'drills', label: 'Sentence drills', glyph: '練', desc: 'Fill-in-the-blank grammar' },
      { id: 'listening', label: 'Listening', glyph: '聴', desc: 'Listen first, then reveal' },
      { id: 'reading', label: 'Reading', glyph: '読', desc: 'Passages with comprehension questions' },
      { id: 'writing', label: 'Writing', glyph: '書', desc: 'Translate English into Japanese' },
      { id: 'exam', label: 'Mock exam', glyph: '試', desc: '30-question timed N5 test' },
    ] },
    { group: 'Track', items: [
      { id: 'progress', label: 'Progress', glyph: '進', desc: 'Streaks, mastery and history' },
      { id: 'bookmarks', label: 'Bookmarks', glyph: '印', desc: 'Everything you starred' },
      { id: 'myplan', label: 'Study plan', glyph: '計', desc: 'Your personal plan, built with the AI coach' },
      { id: 'plan', label: 'N5 roadmap', glyph: '道', desc: 'The standard 8-week roadmap to N5' },
    ] },
    { group: 'Explore', items: [
      { id: 'dictionary', label: 'Dictionary', glyph: '辞', desc: 'Look up any word or kanji' },
      { id: 'anime', label: 'Anime corner', glyph: 'ア', desc: 'Trending anime for immersion' },
      { id: 'resources', label: 'Resources', glyph: '資', desc: 'The best external study sites' },
    ] },
  ];
  const navItem = (id) => S.NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group }))).find((i) => i.id === id);
  S.navItem = navItem;

  // ── Router ──
  const parse = () => {
    const raw = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
    const [path, qs = ''] = raw.split('?');
    const [name, ...params] = path.split('/').filter(Boolean);
    const query = Object.fromEntries(new URLSearchParams(qs));
    return { name: name || 'home', params, query };
  };
  S.go = (route) => {
    const target = `#/${route}`;
    if (location.hash === target) render(); else location.hash = target;
  };
  S.rerender = () => render({ keepScroll: true });

  function render({ keepScroll = false } = {}) {
    S.runLeave();
    S.tts.stop();
    S.$$('.modal-overlay, .palette-overlay').forEach((o) => o.remove());
    const ctx = parse();
    const view = S.views[ctx.name] || S.views.home;
    const name = S.views[ctx.name] ? ctx.name : 'home';
    const main = S.$('#view');
    const y = window.scrollY;
    const page = document.createElement('div');
    page.className = `page page-${name}`;
    main.replaceChildren(page);
    try { view.render(page, ctx); }
    catch (e) {
      console.error(e);
      page.innerHTML = S.ui.empty('Something went wrong', 'This page hit an error. Try reloading.', '<button class="btn" onclick="location.reload()">Reload</button>');
    }
    const item = navItem(name) || { label: view.title || 'Account' };
    document.title = `${item.label} · Sakura Study`;
    S.$('#crumb').innerHTML = `${item.group ? `<span class="crumb-group">${esc(item.group)}</span>${S.icon('right')}` : ''}<span>${esc(item.label)}</span>`;
    S.$$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === name));
    document.body.classList.remove('nav-open');
    if (keepScroll) window.scrollTo(0, y);
    else if (!ctx.params.length) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', () => render());

  // ── Theme ──
  const applyTheme = () => {
    const pref = S.store.settings.get('theme');
    const dark = pref === 'dark' || (pref === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const btn = S.$('#theme-btn');
    if (btn) { btn.innerHTML = S.icon(dark ? 'sun' : 'moon'); btn.title = dark ? 'Light mode' : 'Dark mode'; }
  };
  S.applyTheme = applyTheme;
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

  // ── Shell ──
  function shell() {
    S.$('#sidebar-nav').innerHTML = S.NAV.map((g) => `
      <div class="nav-group">
        ${g.group ? `<div class="nav-label">${esc(g.group)}</div>` : ''}
        ${g.items.map((n) => `<a href="#/${n.id}" class="nav-link" data-nav="${n.id}"><span class="glyph" lang="ja">${n.glyph}</span><span>${esc(n.label)}</span></a>`).join('')}
      </div>`).join('');

    S.$('#menu-btn').innerHTML = S.icon('menu');
    S.$('#search-btn').innerHTML = `${S.icon('search')}<span>Search</span><kbd>/</kbd>`;
    S.$('#sound-btn').innerHTML = S.icon('music');
    S.$('#bottom-nav').innerHTML = [
      ['home', '家', 'Home'], ['review', '覚', 'Cards'], ['quiz', '問', 'Quiz'], ['progress', '進', 'Progress'],
    ].map(([id, g, l]) => `<a href="#/${id}" data-nav="${id}"><span class="glyph" lang="ja">${g}</span>${l}</a>`).join('') +
      `<button id="bottom-menu" aria-label="All sections">${S.icon('grid')}Menu</button>`;

    S.$('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    S.$('#bottom-menu').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    S.$('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
    S.$('#search-btn').addEventListener('click', () => S.search.open());
    S.$('#theme-btn').addEventListener('click', () => {
      S.store.settings.set('theme', document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      applyTheme();
    });
    S.$('#sound-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleSoundMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('nav-open'); });
    applyTheme();
    renderAccount();
  }

  function toggleSoundMenu() {
    const existing = S.$('.sound-menu');
    if (existing) { existing.remove(); return; }
    const m = document.createElement('div');
    m.className = 'sound-menu popover';
    const cur = S.ambient.current;
    m.innerHTML = `<div class="popover-title">Study ambience</div>
      ${S.ambient.SOUNDS.map((s) => `<button class="popover-item ${s.id === cur ? 'on' : ''}" data-amb="${s.id}">${esc(s.label)}${s.id === cur ? S.icon('check') : ''}</button>`).join('')}
      <label class="popover-range">${S.icon('volume')}<input type="range" min="0" max="1" step="0.05" value="${S.store.settings.get('ambientVol') ?? 0.35}" aria-label="Volume"></label>`;
    S.$('#sound-wrap').appendChild(m);
    m.addEventListener('click', (e) => {
      e.stopPropagation();
      const b = e.target.closest('[data-amb]');
      if (!b) return;
      S.ambient.set(b.dataset.amb);
      S.$('#sound-btn').classList.toggle('on', b.dataset.amb !== 'off');
      m.remove();
    });
    S.$('input', m).addEventListener('input', (e) => S.ambient.volume(parseFloat(e.target.value)));
    setTimeout(() => document.addEventListener('click', function off(ev) {
      if (!m.contains(ev.target)) { m.remove(); document.removeEventListener('click', off); }
    }), 0);
  }

  function renderAccount() {
    const u = S.cloud.user;
    const st = S.store.streak();
    const name = u ? u.displayName || u.email.split('@')[0] : '';
    S.$('#account-card').innerHTML = `
      <a href="#/account" class="account-link" data-nav="account">
        ${u ? (u.photoURL ? `<img class="avatar" src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : `<span class="avatar">${esc(name.charAt(0).toUpperCase())}</span>`)
            : `<span class="avatar ghost">${S.icon('user')}</span>`}
        <span class="account-text"><b>${u ? esc(name) : 'Guest learner'}</b><small>${u ? 'Synced to cloud' : 'Sign in to sync'}</small></span>
      </a>
      <span class="streak-chip ${st.studiedToday ? 'lit' : ''}" title="Day streak">${S.icon('flame')}${st.current}</span>`;
  }
  S.renderAccount = renderAccount;

  // ── Boot ──
  document.addEventListener('DOMContentLoaded', () => {
    shell();
    render();
    S.store.on(S.debounce(renderAccount, 100));
    S.cloud.on(() => { renderAccount(); S.rerender(); });
  });
})(window.S);
