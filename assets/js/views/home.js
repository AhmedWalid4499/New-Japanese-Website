// Home — the study dashboard: today's goal, what to do next, mastery at a glance.
(function (S) {
  const esc = S.esc;

  // Me3temed, the study owl
  const OWL = `<svg class="owl" viewBox="0 0 120 130" aria-hidden="true"><ellipse cx="60" cy="88" rx="30" ry="28" fill="#4a6741"/><ellipse cx="60" cy="92" rx="19" ry="20" fill="#f0e8c8"/><path d="M51 84 Q60 78 69 84 Q60 90 51 84Z" fill="#b8a060" opacity=".7"/><ellipse cx="30" cy="90" rx="10" ry="16" fill="#3a5332" transform="rotate(10 30 90)"/><ellipse cx="90" cy="90" rx="10" ry="16" fill="#3a5332" transform="rotate(-10 90 90)"/><circle cx="60" cy="55" r="30" fill="#4a6741"/><ellipse cx="60" cy="58" rx="23" ry="22" fill="#f0e8c8"/><circle cx="49" cy="54" r="11" fill="#1c1c2e"/><circle cx="49" cy="54" r="8.5" fill="#3a7a68"/><circle cx="49" cy="54" r="5" fill="#1c1c2e"/><circle cx="46.5" cy="51.5" r="2.2" fill="#fff"/><circle cx="71" cy="54" r="11" fill="#1c1c2e"/><circle cx="71" cy="54" r="8.5" fill="#3a7a68"/><circle cx="71" cy="54" r="5" fill="#1c1c2e"/><circle cx="68.5" cy="51.5" r="2.2" fill="#fff"/><path d="M56 63 Q60 69 64 63 Q62 67 60 68 Q58 67 56 63Z" fill="#c8a040"/><ellipse cx="44" cy="28" rx="7" ry="11" fill="#3a5332" transform="rotate(-20 44 28)"/><ellipse cx="76" cy="28" rx="7" ry="11" fill="#3a5332" transform="rotate(20 76 28)"/><polygon points="42,75 56,80 56,70" fill="#f0306a"/><polygon points="78,75 64,80 64,70" fill="#f0306a"/><circle cx="60" cy="75" r="5.5" fill="#c01050"/><path d="M50 113l-7 9M50 113v10M50 113l7 9M70 113l-7 9M70 113v10M70 113l7 9" stroke="#c8a040" stroke-width="3.5" stroke-linecap="round"/></svg>`;

  const greeting = () => { const h = new Date().getHours(); return h < 11 ? 'おはよう' : h < 18 ? 'こんにちは' : 'こんばんは'; };

  // Mastery per area, shared with the progress page
  S.mastery = () => {
    const cards = S.store.cards.all();
    const ids = (deck) => S.decks[deck].cards({}).map((c) => c.id);
    const grammarTotal = GRAMMAR_SECTIONS.reduce((a, s) => a + s.items.length, 0);
    const listenTotal = LISTEN_CATEGORIES.reduce((a, c) => a + c.items.length, 0);
    return [
      { label: 'Kana', glyph: 'あ', route: 'review?deck=kana', done: S.store.cards.mastered(ids('kana'), cards), total: ids('kana').length, how: 'mastered in flashcards' },
      { label: 'Kanji', glyph: '漢', route: 'review?deck=kanji', done: S.store.cards.mastered(ids('kanji'), cards), total: KANJI.length, how: 'mastered in flashcards' },
      { label: 'Vocabulary', glyph: '語', route: 'review?deck=vocab', done: S.store.cards.mastered(ids('vocab'), cards), total: ids('vocab').length, how: 'mastered in flashcards' },
      { label: 'Grammar', glyph: '文', route: 'grammar', done: S.store.srs.count('grammar', 'known'), total: grammarTotal, how: 'marked “Know it”' },
      { label: 'Phrases', glyph: '話', route: 'phrases', done: S.store.srs.count('phrases', 'known'), total: SURVIVAL_PHRASES.length, how: 'marked “Know it”' },
      { label: 'Listening', glyph: '聴', route: 'listening', done: S.store.srs.count('listen', 'known'), total: listenTotal, how: 'marked “Know it”' },
    ];
  };

  function nextSteps(due) {
    const steps = [];
    if (due) steps.push({ glyph: '覚', title: `Review ${due} due card${due > 1 ? 's' : ''}`, sub: 'Spaced repetition keeps them in long-term memory', route: 'review' });
    const plan = S.store.plan.all();
    for (let w = 0; w < STUDY_PLAN.length && steps.length < 2; w++) {
      const t = STUDY_PLAN[w].tasks.findIndex((_, i) => !plan[`${w}-${i}`]);
      if (t >= 0) { steps.push({ glyph: '計', title: STUDY_PLAN[w].tasks[t], sub: `${STUDY_PLAN[w].week} · ${STUDY_PLAN[w].title}`, route: 'plan' }); break; }
    }
    const scores = S.store.scores.list();
    if (!scores.some((s) => /mock exam/i.test(s.type)) && scores.length >= 3) steps.push({ glyph: '試', title: 'Take your first mock exam', sub: 'See where you stand across grammar, kanji and vocab', route: 'exam' });
    else if (!scores.length) steps.push({ glyph: 'あ', title: 'Warm up with a kana quiz', sub: '20 quick questions — about two minutes', route: 'quiz?type=kana' });
    else steps.push({ glyph: '読', title: 'Read a short passage', sub: 'Comprehension practice with explanations', route: 'reading' });
    return steps.slice(0, 3);
  }

  S.view('home', {
    render(root) {
      const u = S.cloud.user;
      const name = u ? (u.displayName || u.email.split('@')[0]) : '';
      const st = S.store.streak();
      const goal = S.store.settings.get('dailyGoal');
      const today = S.store.activity.today();
      const due = S.dueCount();
      const scores = S.store.scores.list();
      const tipStart = Math.floor(Math.random() * MASCOT_TIPS.length);

      root.innerHTML = `
        <section class="hero">
          <div class="hero-text">
            <div class="kicker" lang="ja">${greeting()}${name ? `、${esc(name)}さん` : ''}</div>
            <h1>${st.studiedToday ? 'Nice work today. Keep the momentum going.' : st.current ? `You’re on a ${st.current}-day streak — study today to keep it.` : 'Ready to study? Small steps every day add up.'}</h1>
            <div class="row gap wrap">
              <button class="btn primary lg" data-go="${due ? 'review' : 'quiz'}">${S.icon(due ? 'cards' : 'play')} ${due ? `Review ${due} cards` : 'Start a quick quiz'}</button>
              <button class="btn lg" data-go="plan">${S.icon('target')} Study plan</button>
            </div>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">${S.ui.ring(S.pct(Math.min(today, goal), goal), { size: 84, stroke: 8, label: `${Math.min(today, goal)}/${goal}` })}<span>Daily goal</span></div>
            <div class="hero-stat"><b class="streak ${st.studiedToday ? 'lit' : ''}">${S.icon('flame')}${st.current}</b><span>Day streak</span></div>
            <div class="hero-stat"><b>${due}</b><span>Cards due</span></div>
          </div>
        </section>

        <div class="home-grid">
          <section class="card">
            <h2 class="card-title">Up next</h2>
            <div class="next-list">${nextSteps(due).map((s) => `<a class="next-item" href="#/${s.route}"><span class="glyph" lang="ja">${s.glyph}</span><span><b>${esc(s.title)}</b><small>${esc(s.sub)}</small></span>${S.icon('right')}</a>`).join('')}</div>
          </section>
          <section class="card tip-card">
            ${OWL}
            <div><h2 class="card-title">Me3temed’s tip</h2><p data-tip>${esc(MASCOT_TIPS[tipStart])}</p>
            <button class="btn ghost sm" data-next-tip>Another tip ${S.icon('right')}</button></div>
          </section>
        </div>

        <section class="section-block">
          <div class="section-head"><h2 class="section-title">Your N5 mastery</h2><a class="link" href="#/progress">Full progress ${S.icon('arrow')}</a></div>
          <div class="mastery-grid">${S.mastery().map((m) => `<a class="card mastery" href="#/${m.route}" title="${m.done} ${m.how}">
            ${S.ui.ring(S.pct(m.done, m.total), { size: 60, stroke: 6 })}<span><b>${m.label}</b><small>${m.done} / ${m.total}</small></span></a>`).join('')}</div>
        </section>

        ${S.NAV.slice(1, 3).map((g) => `<section class="section-block">
          <h2 class="section-title">${esc(g.group)}</h2>
          <div class="tile-grid">${g.items.map((n) => `<a class="tile" href="#/${n.id}"><span class="glyph" lang="ja">${n.glyph}</span><span><b>${esc(n.label)}</b><small>${esc(n.desc)}</small></span></a>`).join('')}</div>
        </section>`).join('')}

        ${scores.length ? `<section class="card">
          <div class="section-head"><h2 class="card-title">Recent results</h2><a class="link" href="#/progress">History ${S.icon('arrow')}</a></div>
          <ul class="history">${scores.slice(0, 5).map((s) => `<li><span>${esc(s.type)}</span>${S.ui.bar(s.pct, S.ui.scoreTone(s.pct))}<b>${s.score}/${s.total}</b><small class="muted">${S.fmtDate(s.date)}</small></li>`).join('')}</ul>
        </section>` : ''}`;

      let tip = tipStart;
      S.$('[data-next-tip]', root).addEventListener('click', () => { tip = (tip + 1) % MASCOT_TIPS.length; S.$('[data-tip]', root).textContent = MASCOT_TIPS[tip]; });
    },
  });
})(window.S);
