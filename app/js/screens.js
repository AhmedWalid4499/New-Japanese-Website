// App screens: Learn (path), Letters, Practice, Profile + onboarding & settings.
(function (A) {
  const esc = A.esc;
  A.screens = {};

  // ── Top status bar (streak, XP, hearts) ──
  A.statusBar = () => {
    const st = A.streak();
    return `<div class="status-bar">
      <button class="status flag" data-go="profile" aria-label="Course">🇯🇵</button>
      <button class="status streak ${st.today ? 'lit' : ''}" data-info="streak" aria-label="Streak">${A.icon('flame')}<b>${st.n}</b></button>
      <button class="status xp" data-info="xp">${A.icon('bolt')}<b>${A.state.xp}</b></button>
      <button class="status heart" data-info="hearts" aria-label="Petals">${A.icon('heart')}<b>${A.hearts()}</b></button>
    </div>`;
  };
  document.addEventListener('click', (e) => {
    const i = e.target.closest('[data-info]');
    if (!i) return;
    const kind = i.dataset.info;
    const st = A.streak();
    const goal = A.state.profile.goal, today = A.todayXp();
    const mins = Math.ceil(A.nextHeartIn() / 60000);
    const html = {
      streak: `<div class="sheet-body center"><div class="streak-big ${st.today ? 'lit' : 'off'}">${A.icon('flame')}<b>${st.n}</b></div><h2>${st.n ? `${st.n} day${st.n > 1 ? 's' : ''} in a row` : 'Light your first lantern'}</h2>
        <p class="muted">${st.today ? 'You’ve practised today. See you tomorrow!' : 'Finish a lesson today to ' + (st.n ? 'keep your lantern glowing!' : 'light your first lantern!')}</p><div class="week-dots">${A.weekDots()}</div>
        <p class="muted small">Longest streak: ${st.best} days</p></div>`,
      xp: `<div class="sheet-body center"><h2>Daily goal</h2><div class="goal-ring">${ring(Math.min(100, (today / goal) * 100), `${today}/${goal}`)}</div>
        <p class="muted">${today >= goal ? 'Goal reached — 素晴らしい!' : `Earn ${goal - today} more XP today to hit your goal.`}</p><p class="muted small">Total: ${A.state.xp} XP</p></div>`,
      hearts: `<div class="sheet-body center"><div class="hearts-row">${Array.from({ length: A.MAX_HEARTS }, (_, k) => `<span class="${k < A.hearts() ? 'on' : ''}">${A.icon('heart')}</span>`).join('')}</div>
        <h2>${A.hearts() === A.MAX_HEARTS ? 'All petals in bloom' : `${A.hearts()} petal${A.hearts() === 1 ? '' : 's'} left`}</h2><p class="muted">Each mistake in a lesson costs a petal. ${A.hearts() < A.MAX_HEARTS ? `The next one grows back in ${mins} min.` : ''}</p>
        ${A.hearts() < A.MAX_HEARTS ? '<button class="btn primary block" data-close data-practice-heart>Practice to earn a petal</button>' : ''}</div>`,
    }[kind];
    const s = A.sheet(html);
    const ph = A.$('[data-practice-heart]', s.el);
    if (ph) ph.addEventListener('click', () => A.startPractice('review', true));
  });

  const ring = (pct, label, size = 120) => {
    const r = (size - 14) / 2, c = 2 * Math.PI * r;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="12"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--gold)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c - (c * pct) / 100}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="ring-text">${label}</text></svg>`;
  };
  A.ring = ring;

  // ── LEARN: the path ──
  A.screens.learn = (el) => {
    const cur = A.currentLesson();
    const goal = A.state.profile.goal, today = A.todayXp();
    el.innerHTML = `${A.statusBar()}<div class="petals" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      ${!isStandalone() && isIOS() && !A.state.dismissInstall ? `<div class="install-tip"><span>${A.icon('share')}</span><div><b>Install Sakura Study</b><br>Tap Share, then “Add to Home Screen”.</div><button class="icon-btn" data-dismiss-install aria-label="Dismiss">${A.icon('x')}</button></div>` : ''}
      <div class="goal-strip" data-info="xp"><span>Daily goal</span><div class="goal-bar"><i style="width:${Math.min(100, (today / goal) * 100)}%"></i></div><b>${today}/${goal} XP</b></div>
      <div class="path">${A.UNITS.map((u) => unitHtml(u, cur)).join('')}
        <div class="path-end"><span class="hanko big" lang="ja">N5</span><p>The end of the N5 journey. おめでとう!</p></div></div>`;
    const dis = A.$('[data-dismiss-install]', el);
    if (dis) dis.addEventListener('click', () => { A.state.dismissInstall = true; A.save(); dis.closest('.install-tip').remove(); });
    el.addEventListener('click', (e) => {
      const n = e.target.closest('[data-lesson]');
      if (n) return lessonPopup(n);
      const g = e.target.closest('[data-guide]');
      if (g) guide(A.UNITS.find((u) => u.id === g.dataset.guide));
    });
    // Scroll the current lesson into view
    requestAnimationFrame(() => { const c = A.$('.node.current', el); if (c) c.scrollIntoView({ block: 'center' }); });
  };

  // Stops wind down the page like a mountain trail, joined by an ink line
  const OFFSETS = [0, 52, 78, 52, 0, -52, -78, -52];
  const STEP = 96; // px between stops
  const KANJI_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  A.kanjiNum = (n) => (n <= 10 ? KANJI_NUM[n] : n < 20 ? `十${KANJI_NUM[n - 10]}` : `${KANJI_NUM[Math.floor(n / 10)]}十${KANJI_NUM[n % 10]}`);
  function trail(u) {
    const xs = u.lessons.map((_, i) => OFFSETS[(i + u.index * 3) % OFFSETS.length]);
    const h = u.lessons.length * STEP;
    let d = `M ${180 + xs[0]} ${STEP / 2}`;
    for (let i = 1; i < xs.length; i++) {
      const y0 = (i - 1) * STEP + STEP / 2, y1 = i * STEP + STEP / 2;
      d += ` C ${180 + xs[i - 1]} ${y0 + STEP / 2}, ${180 + xs[i]} ${y1 - STEP / 2}, ${180 + xs[i]} ${y1}`;
    }
    const doneN = u.lessons.filter(A.lessonDone).length;
    return `<svg class="trail" viewBox="0 0 360 ${h}" preserveAspectRatio="xMidYMin meet" style="height:${h}px" aria-hidden="true">
      <path d="${d}" class="trail-line"/>${doneN ? `<path d="${d}" class="trail-done" pathLength="${u.lessons.length - 1 || 1}" stroke-dasharray="${Math.max(0, doneN - (doneN === u.lessons.length ? 1 : 0))} 999"/>` : ''}</svg>`;
  }
  function unitHtml(u, cur) {
    const done = A.unitProgress(u);
    return `<section class="unit" style="--u:${u.color};--ud:${u.dark}">
      <header class="unit-head">
        <span class="chapter" lang="ja">第${A.kanjiNum(u.index + 1)}章</span>
        <div class="unit-text"><h2>${esc(u.title)}</h2><div class="unit-meta"><span lang="ja">${esc(u.jp)}</span> · ${done}/${u.lessons.length} stamps</div></div>
        <button class="guide-btn" data-guide="${u.id}" aria-label="Guidebook">${A.icon('book')}</button>
      </header>
      <div class="nodes">${trail(u)}${u.lessons.map((l, i) => {
        const isDone = A.lessonDone(l), isCur = cur === l, locked = !A.isUnlocked(l);
        const face = isDone ? '<span class="stamp" lang="ja">済</span>' : locked ? A.icon('lock') : `<span class="stop-num">${i + 1}</span>`;
        const off = OFFSETS[(i + u.index * 3) % OFFSETS.length];
        return `<div class="node-wrap" style="transform:translateX(${off}px)">
          ${isCur ? `<div class="start-bubble" lang="ja">はじめ <small>Start</small></div>` : ''}
          <button class="node ${isDone ? 'done' : ''} ${isCur ? 'current' : ''} ${locked ? 'locked' : ''}" data-lesson="${l.key}" aria-label="Lesson ${i + 1}${isDone ? ', completed' : locked ? ', locked' : ''}">${face}</button>
          ${i === 2 && !locked ? `<div class="path-owl" style="transform:translateX(${off > 0 ? -118 : 118}px)">${A.owl('mini')}</div>` : ''}
        </div>`;
      }).join('')}</div></section>`;
  }

  function lessonPopup(btn) {
    const l = A.allLessons.find((x) => x.key === btn.dataset.lesson);
    const u = l.unit, done = A.lessonDone(l), locked = !A.isUnlocked(l);
    const preview = l.items.slice(0, 6).map((it) => `<span lang="ja">${esc(it.jp)}</span>`).join(' ');
    const s = A.sheet(`<div class="sheet-body lesson-pop" style="--u:${u.color};--ud:${u.dark}">
      <div class="pop-kicker" lang="ja">第${A.kanjiNum(u.index + 1)}章 · ${esc(u.title)}</div>
      <h2>Stop ${l.index + 1} of ${u.lessons.length}</h2>
      <div class="pop-preview">${preview}</div>
      ${locked ? '<p class="muted">Complete the lessons above to unlock this one!</p><button class="btn block" data-close>OK</button>'
        : `<button class="btn unit-btn block lg" data-start>${done ? 'Practice again +5 XP' : 'Start +10 XP'}</button>`}
    </div>`);
    const st = A.$('[data-start]', s.el);
    if (st) st.addEventListener('click', () => { s.close(); startLesson(l); });
  }

  function startLesson(l) {
    if (A.hearts() === 0) {
      const s = A.sheet(`<div class="sheet-body center">${A.owl('sad')}<h2>Out of petals</h2><p class="muted">The next petal grows back in ${Math.ceil(A.nextHeartIn() / 60000)} minutes — or practise to earn one now.</p>
        <button class="btn primary block" data-close data-p>Practice to earn a petal</button></div>`);
      A.$('[data-p]', s.el).addEventListener('click', () => A.startPractice('review', true));
      return;
    }
    const wasDone = A.lessonDone(l);
    A.play({
      exercises: A.buildLesson(l), xp: wasDone ? 5 : 10,
      onDone: (r) => {
        if (r && !r.outOfHearts) {
          const rec = A.state.lessons[l.key] || { done: 0, best: 0 };
          rec.done++; rec.best = Math.max(rec.best, r.acc);
          A.state.lessons[l.key] = rec;
          A.checkAchievements();
          A.save();
        }
        if (r && r.practice) return A.startPractice('review', true);
        A.go('learn');
      },
    });
  }
  A.startLesson = startLesson;

  function guide(u) {
    A.sheet(`<div class="sheet-body guide" style="--u:${u.color}">
      <div class="pop-kicker" lang="ja">第${A.kanjiNum(u.index + 1)}章 · Guidebook</div><h2>${esc(u.title)}</h2>
      ${u.guide.map((g) => `<section><h3 lang="ja">${esc(g.h)}</h3><p>${esc(g.p)}</p>${g.ex ? `<div class="guide-ex"><button class="speaker" data-say-g="${esc(g.ex.jp)}">${A.icon('volume')}</button><div><div lang="ja">${esc(g.ex.jp)}</div><small>${esc(g.ex.en)}</small></div></div>` : ''}</section>`).join('')}
      <h3>Key words</h3><div class="key-words">${u.items.slice(0, 12).map((it) => `<button class="kw" data-say-g="${esc(it.say)}"><span lang="ja">${esc(it.jp)}</span><small>${esc(it.en)}</small></button>`).join('')}</div>
      <button class="btn primary block" data-close>Got it</button></div>`).el.addEventListener('click', (e) => { const s = e.target.closest('[data-say-g]'); if (s) A.speak(s.dataset.sayG); });
  }

  // ── LETTERS: kana charts ──
  A.screens.letters = (el) => {
    let script = A.state.lettersScript || 'h';
    const paint = () => {
      const rows = script === 'h' ? HIRAGANA_ROWS : KATAKANA_ROWS;
      const learned = (k) => A.state.srs[`${script}:${k}`];
      const all = rows.flatMap((r) => r.cells).filter((c) => c.k);
      const known = all.filter((c) => (learned(c.k)?.box || 0) >= 2).length;
      el.innerHTML = `${A.statusBar()}
        <div class="screen-head"><h1>Let’s learn ${script === 'h' ? 'hiragana' : 'katakana'}!</h1><p class="muted">Get to know the main writing systems of Japanese.</p></div>
        <div class="seg"><button class="${script === 'h' ? 'on' : ''}" data-s="h" lang="ja">ひらがな</button><button class="${script === 'k' ? 'on' : ''}" data-s="k" lang="ja">カタカナ</button></div>
        <button class="btn primary block lg" data-learn>Learn the characters</button>
        <div class="letters-progress">${known}/${all.length} mastered<div class="goal-bar"><i style="width:${(known / all.length) * 100}%"></i></div></div>
        ${[['Basic', rows.slice(0, 11)], ['Voiced', rows.slice(11, 16)], ['Combinations', rows.slice(16)]].filter(([, r]) => r.length).map(([t, r]) => `
          <h3 class="letters-title">${t}</h3>
          <div class="letters ${t === 'Combinations' ? 'combo' : ''}">${r.flatMap((row) => row.cells).map((c) => c.k
            ? `<button class="letter" data-k="${esc(c.k)}"><span lang="ja">${esc(c.k)}</span><small>${esc(c.r)}</small><i style="width:${Math.min(100, ((learned(c.k)?.box || 0) / 4) * 100)}%"></i></button>`
            : '<span class="letter empty"></span>').join('')}</div>`).join('')}`;
    };
    el.addEventListener('click', (e) => {
      const s = e.target.closest('[data-s]');
      if (s) { script = s.dataset.s; A.state.lettersScript = script; A.save(); paint(); return; }
      const k = e.target.closest('[data-k]');
      if (k) { A.speak(k.dataset.k); k.classList.add('pulse'); setTimeout(() => k.classList.remove('pulse'), 500); return; }
      if (e.target.closest('[data-learn]')) {
        const rows = script === 'h' ? HIRAGANA_ROWS : KATAKANA_ROWS;
        const its = rows.flatMap((r) => r.cells).filter((c) => c.k && !/[ぢづヂヅ]/.test(c.k)).map((c) => A.items[`${script}:${c.k}`]).filter(Boolean);
        const weakest = its.sort((a, b) => (A.state.srs[a.id]?.box || 0) - (A.state.srs[b.id]?.box || 0)).slice(0, 10);
        A.play({ exercises: A.buildPractice(A.shuffle(weakest)), hearts: false, xp: 5, doneTitle: 'Practice complete!', onDone: () => A.go('letters') });
      }
    });
    paint();
  };

  // ── PRACTICE hub ──
  A.startPractice = (kind, forHeart) => {
    const learned = Object.keys(A.state.srs).map((id) => A.items[id]).filter(Boolean);
    let list = [];
    if (kind === 'mistakes') list = A.mistakeItems().map((id) => A.items[id]);
    else if (kind === 'listen') list = A.sample(learned.filter((i) => i.kind !== 'kanji'), 10);
    else { const due = A.dueItems().map((id) => A.items[id]).filter(Boolean); list = [...A.sample(due, 10), ...A.sample(learned, 10)].filter((x, i, a) => a.indexOf(x) === i).slice(0, 10); }
    list = list.filter(Boolean).slice(0, 10);
    if (list.length < 4) { A.toast('Finish a few lessons first — then come back to practise!'); return; }
    A.play({
      exercises: A.buildPractice(list, { kinds: kind === 'listen' ? 'listen' : '' }), hearts: false, xp: 5, doneTitle: 'Practice complete!',
      onDone: (r) => { if (r && forHeart) { A.gainHeart(1); A.toast('+1 petal 🌸'); } A.go(forHeart ? 'learn' : 'practice'); },
    });
  };

  A.screens.practice = (el) => {
    const learned = A.learnedCount(), due = A.dueItems().length, mistakes = A.mistakeItems().length;
    el.innerHTML = `${A.statusBar()}
      <div class="screen-head"><h1>Practice</h1><p class="muted">Strengthen what you’ve learned. Practice never costs petals.</p></div>
      <div class="practice-list">
        ${card('review', 'Personalized review', due ? `${due} items ready for review` : 'A mix of everything you’ve learned', '覚', '#6b8f3a', '#53712c')}
        ${card('mistakes', 'Mistakes', mistakes ? `${mistakes} items to fix` : 'No recent mistakes — nice!', '直', '#c4473a', '#9c372c')}
        ${card('listen', 'Listening', 'Train your ear with native audio', '聴', '#3b5a8c', '#2c446b')}
        ${card('phrases', 'Phrasebook', 'Survival phrases with audio', '話', '#c9922a', '#a0731d')}
      </div>
      <p class="muted center small">${learned} words, characters and phrases learned so far.</p>`;
    el.addEventListener('click', (e) => {
      const c = e.target.closest('[data-p]');
      if (!c) return;
      if (c.dataset.p === 'phrases') return phrasebook();
      A.startPractice(c.dataset.p);
    });
  };
  const card = (id, title, sub, glyph, color, dark) => `<button class="pcard" data-p="${id}" style="--u:${color};--ud:${dark}"><span class="pcard-icon" lang="ja">${glyph}</span><span class="pcard-text"><b>${esc(title)}</b><small>${esc(sub)}</small></span><span class="chev">›</span></button>`;

  function phrasebook() {
    const cats = { greetings: 'Greetings', shopping: 'Shopping', restaurant: 'Restaurant', directions: 'Directions', transport: 'Transport', hotel: 'Hotel', emergency: 'Emergency' };
    A.sheet(`<div class="sheet-body phrasebook"><h2>Phrasebook</h2>
      ${Object.entries(cats).map(([c, t]) => `<h3>${t}</h3>${SURVIVAL_PHRASES.filter((p) => p.cat === c).map((p) => `<button class="phrase" data-say-p="${esc(p.jp)}"><span class="speaker sm">${A.icon('volume')}</span><span><span lang="ja">${esc(p.jp)}</span><small>${esc(p.rom)}</small><em>${esc(p.en)}</em></span></button>`).join('')}`).join('')}
      <button class="btn primary block" data-close>Done</button></div>`).el.addEventListener('click', (e) => { const s = e.target.closest('[data-say-p]'); if (s) A.speak(s.dataset.sayP); });
  }

  // ── PROFILE ──
  const ACHIEVEMENTS = [
    { id: 'first', title: 'First steps', desc: 'Complete your first lesson', icon: '🌱', test: () => Object.keys(A.state.lessons).length >= 1 },
    { id: 'kana', title: 'Kana reader', desc: 'Finish Hiragana basics', icon: 'あ', test: () => A.unitProgress(A.UNITS[0]) === A.UNITS[0].lessons.length },
    { id: 'xp100', title: 'Scholar', desc: 'Earn 100 XP', icon: '⚡', test: () => A.state.xp >= 100 },
    { id: 'streak7', title: 'On fire', desc: 'Reach a 7 day streak', icon: '🔥', test: () => A.state.streak.best >= 7 },
    { id: 'words100', title: 'Word collector', desc: 'Learn 100 items', icon: '📚', test: () => A.learnedCount() >= 100 },
    { id: 'units5', title: 'Explorer', desc: 'Complete 5 units', icon: '🗾', test: () => A.UNITS.filter((u) => A.unitProgress(u) === u.lessons.length).length >= 5 },
    { id: 'xp1000', title: 'Sensei in training', desc: 'Earn 1,000 XP', icon: '🏆', test: () => A.state.xp >= 1000 },
  ];
  A.checkAchievements = () => {
    ACHIEVEMENTS.forEach((a) => { if (!A.state.achievements[a.id] && a.test()) { A.state.achievements[a.id] = Date.now(); setTimeout(() => A.toast(`Achievement unlocked: ${a.icon} ${a.title}`), 600); } });
  };

  A.screens.profile = (el) => {
    const p = A.state.profile, st = A.streak();
    const lessons = Object.values(A.state.lessons).filter((x) => x.done).length;
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(Date.now() - i * 86400000); days.push({ l: 'SMTWTFS'[d.getDay()], xp: A.state.daily[A.dayKey(d)] || 0 }); }
    const max = Math.max(p.goal, ...days.map((d) => d.xp));
    el.innerHTML = `
      <div class="profile-top">
        <button class="icon-btn settings-btn" data-settings aria-label="Settings">${A.icon('gear')}</button>
        <div class="avatar" lang="ja">${esc((p.name || '桜').charAt(0).toUpperCase())}</div>
        <h1>${esc(p.name || 'Sakura learner')}</h1>
        <p class="muted small">Learning Japanese 🇯🇵 · Joined ${new Date(p.created).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
      </div>
      <h3 class="section-label">Statistics</h3>
      <div class="stat-grid">
        <div class="stat-box"><span class="s-ic flame">${A.icon('flame')}</span><b>${st.n}</b><small>Day streak</small></div>
        <div class="stat-box"><span class="s-ic bolt">${A.icon('bolt')}</span><b>${A.state.xp}</b><small>Total XP</small></div>
        <div class="stat-box"><span class="s-ic star">${A.icon('star')}</span><b>${lessons}</b><small>Lessons done</small></div>
        <div class="stat-box"><span class="s-ic book">${A.icon('book')}</span><b>${A.learnedCount()}</b><small>Items learned</small></div>
      </div>
      <h3 class="section-label">This week</h3>
      <div class="card week-chart">${days.map((d) => `<div class="wk"><i style="height:${(d.xp / max) * 100}%"></i><small>${d.l}</small></div>`).join('')}
        <div class="goal-line" style="bottom:calc(${(p.goal / max) * 100}% * .78 + 22px)"><span>goal</span></div></div>
      <h3 class="section-label">Achievements</h3>
      <div class="card ach-list">${ACHIEVEMENTS.map((a) => `<div class="ach ${A.state.achievements[a.id] ? 'on' : ''}"><span class="ach-ic">${a.icon}</span><div><b>${esc(a.title)}</b><small>${esc(a.desc)}</small></div>${A.state.achievements[a.id] ? A.icon('check') : ''}</div>`).join('')}</div>
      <a class="btn block ghost" href="../" target="_blank" rel="noopener">Open the full Sakura Study website ↗</a>`;
    A.$('[data-settings]', el).addEventListener('click', settings);
  };

  function settings() {
    const p = A.state.profile;
    const s = A.sheet(`<div class="sheet-body settings"><h2>Settings</h2>
      <label class="field"><span>Name</span><input data-name value="${esc(p.name)}" placeholder="Your name" maxlength="24"></label>
      <div class="field"><span>Daily goal</span><div class="goal-opts">${[[10, 'Casual'], [20, 'Regular'], [30, 'Serious'], [50, 'Intense']].map(([v, l]) => `<button class="${p.goal === v ? 'on' : ''}" data-goal="${v}"><b>${l}</b><small>${v} XP / day</small></button>`).join('')}</div></div>
      <label class="toggle"><span>Sound effects</span><input type="checkbox" data-t="sound" ${p.sound ? 'checked' : ''}><i></i></label>
      <label class="toggle"><span>Show romaji hints</span><input type="checkbox" data-t="romaji" ${p.romaji ? 'checked' : ''}><i></i></label>
      <div class="field"><span>Speaking speed</span><div class="goal-opts three">${[[0.6, 'Slow'], [0.85, 'Natural'], [1, 'Fast']].map(([v, l]) => `<button class="${p.rate === v ? 'on' : ''}" data-rate="${v}"><b>${l}</b></button>`).join('')}</div></div>
      <button class="btn block" data-test>${A.icon('volume')} Test voice</button>
      <button class="btn primary block" data-close>Done</button>
      <button class="btn ghost danger block" data-reset>Reset all progress</button></div>`, { onClose: () => A.go(A.tab) });
    s.el.addEventListener('input', (e) => { if (e.target.matches('[data-name]')) { p.name = e.target.value.trim(); A.save(); } });
    s.el.addEventListener('change', (e) => { const t = e.target.closest('[data-t]'); if (t) { p[t.dataset.t] = t.checked; A.save(); } });
    s.el.addEventListener('click', (e) => {
      const g = e.target.closest('[data-goal]'), r = e.target.closest('[data-rate]');
      if (g) { p.goal = +g.dataset.goal; A.$$('[data-goal]', s.el).forEach((b) => b.classList.toggle('on', b === g)); A.save(); }
      if (r) { p.rate = +r.dataset.rate; A.$$('[data-rate]', s.el).forEach((b) => b.classList.toggle('on', b === r)); A.save(); A.speak('こんにちは'); }
      if (e.target.closest('[data-test]')) A.speak('こんにちは。いっしょに にほんごを べんきょうしましょう。');
      if (e.target.closest('[data-reset]') && confirm('Reset ALL progress in the app? This can’t be undone.')) A.resetAll();
    });
  }

  // ── Onboarding ──
  A.onboarding = (done) => {
    const root = document.createElement('div');
    root.className = 'onboard';
    let goal = 20;
    const steps = [
      () => `<div class="ob-body">${A.owl('big wave')}<div class="speech-bubble">こんにちは！ I’m <b>Me3temed</b>.<br>Let’s learn Japanese together!</div></div>
        <div class="ob-foot"><button class="btn primary block lg" data-next>Get started</button></div>`,
      () => `<div class="ob-body"><div class="ob-row">${A.owl('mini')}<div class="speech-bubble left">What’s your daily learning goal?</div></div>
        <div class="goal-opts list">${[[10, 'Casual', '5 min'], [20, 'Regular', '10 min'], [30, 'Serious', '15 min'], [50, 'Intense', '20 min']].map(([v, l, m]) => `<button class="${goal === v ? 'on' : ''}" data-goal="${v}"><b>${m} / day</b><small>${l}</small></button>`).join('')}</div></div>
        <div class="ob-foot"><button class="btn primary block lg" data-next>Continue</button></div>`,
      () => `<div class="ob-body">${A.owl('big cheer')}<div class="speech-bubble">Great! We’ll start with <b>hiragana</b>, the first Japanese alphabet. 🌸</div></div>
        <div class="ob-foot"><button class="btn primary block lg" data-next>Start my first lesson</button></div>`,
    ];
    let i = 0;
    const paint = () => { root.innerHTML = steps[i](); };
    root.addEventListener('click', (e) => {
      const g = e.target.closest('[data-goal]');
      if (g) { goal = +g.dataset.goal; A.$$('[data-goal]', root).forEach((b) => b.classList.toggle('on', b === g)); A.sfx('tap'); }
      if (e.target.closest('[data-next]')) {
        A.sfx('tap');
        if (++i < steps.length) paint();
        else { A.state.profile.goal = goal; A.state.profile.onboarded = true; A.save(); root.remove(); done(true); }
      }
    });
    document.body.appendChild(root);
    paint();
  };

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = () => window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
})(window.A);
