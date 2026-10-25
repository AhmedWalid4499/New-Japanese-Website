// Reading — every passage in one place: read, listen, answer, then check explanations.
(function (S) {
  const esc = S.esc;
  const TOPICS = { daily: 'Daily life', school: 'School', travel: 'Travel', culture: 'Culture', nature: 'Nature' };
  const LEVELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
  const SHORT_TOPICS = ['daily', 'daily', 'daily', 'daily', 'nature'];

  // READING_TESTS (short passages) + COMP_PASSAGES (longer, with explanations) as one list
  let cache = null;
  S.readingPassages = () => cache || (cache = [
    ...READING_TESTS.map((t, i) => ({
      id: `r${i + 1}`, cat: SHORT_TOPICS[i] || 'daily', diff: 'beginner', title: t.title, titleEn: '', passage: t.passage, passageEn: t.passageRom,
      questions: t.questions.map((q) => ({ q: q.q, opts: q.opts, ans: q.ans, exp: '' })),
    })),
    ...COMP_PASSAGES,
  ]);

  const best = (id) => S.store.scores.list().filter((s) => s.ref === id).reduce((m, s) => Math.max(m, s.pct), -1);

  function list(root, state) {
    const all = S.readingPassages();
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Reading', jp: 'どっかい', desc: `${all.length} N5-level passages. Read the questions first so you know what to look for.` })}
      <div class="toolbar">
        ${S.ui.chips('topic', [{ value: 'all', label: 'All topics' }, ...Object.entries(TOPICS).map(([value, label]) => ({ value, label, count: all.filter((p) => p.cat === value).length }))], state.topic)}
        ${S.ui.chips('level', [{ value: 'all', label: 'Any level' }, ...Object.entries(LEVELS).map(([value, label]) => ({ value, label }))], state.level)}
      </div>
      <div class="passage-grid" data-grid></div>`;
    const grid = S.$('[data-grid]', root);
    const paint = () => {
      const items = all.filter((p) => (state.topic === 'all' || p.cat === state.topic) && (state.level === 'all' || p.diff === state.level));
      grid.innerHTML = items.map((p) => {
        const b = best(p.id);
        return `<a class="card passage-card" href="#/reading/${p.id}">
          <div class="row gap">${S.ui.badge(TOPICS[p.cat] || p.cat, 'soft')}${S.ui.badge(LEVELS[p.diff] || p.diff, p.diff)}<span class="spacer"></span>${b >= 0 ? S.ui.badge(`Best ${b}%`, S.ui.scoreTone(b)) : ''}</div>
          <h3 lang="ja">${esc(p.title)}</h3>${p.titleEn ? `<div class="muted">${esc(p.titleEn)}</div>` : ''}
          <p class="passage-preview" lang="ja">${esc(p.passage.slice(0, 70))}…</p>
          <div class="muted small">${p.questions.length} questions</div>
        </a>`;
      }).join('') || `<div class="span-all">${S.ui.empty('No passages match', 'Try a different topic or level.')}</div>`;
    };
    root.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-chip]');
      if (!chip) return;
      const g = chip.closest('[data-chips]').dataset.chips;
      state[g] = chip.dataset.chip;
      S.ui.setChip(root, g, chip.dataset.chip);
      paint();
    });
    paint();
  }

  function test(root, p) {
    const picks = {};
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Reading', title: p.title, desc: p.titleEn ? esc(p.titleEn) : '', actions: `<a class="btn ghost" href="#/reading">${S.icon('left')} All passages</a>` })}
      <div class="reading-layout">
        <article class="card passage">
          <div class="row gap"><b>Passage</b><span class="spacer"></span>${S.ui.speak(p.passage, { label: 'Listen' })}</div>
          <p class="passage-text" lang="ja">${esc(p.passage)}</p>
          <details><summary>Show English translation</summary><p class="muted">${esc(p.passageEn)}</p></details>
        </article>
        <div class="stack" data-qs>
          ${p.questions.map((q, i) => `<section class="card question" data-qi="${i}">
            <div class="kicker">Question ${i + 1} of ${p.questions.length}</div>
            <h3 class="question-text" lang="ja">${esc(q.q)}</h3>
            <div class="options">${q.opts.map((o, k) => `<button class="option" data-pick="${i}:${k}" lang="ja"><span class="opt-letter">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>
            <div class="feedback" data-fb></div>
          </section>`).join('')}
          <div class="card result" data-result hidden></div>
          <button class="btn primary block" data-submit>${S.icon('check')} Check answers</button>
        </div>
      </div>`;

    const qs = S.$('[data-qs]', root);
    qs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if (b && !qs.dataset.done) {
        const [qi, k] = b.dataset.pick.split(':').map(Number);
        picks[qi] = k;
        S.$$(`[data-pick^="${qi}:"]`, qs).forEach((x) => x.classList.toggle('selected', x === b));
      }
      if (e.target.closest('[data-submit]')) submit();
      if (e.target.closest('[data-retry]')) test(root, p);
    });

    function submit() {
      const missing = p.questions.findIndex((_, i) => picks[i] == null);
      if (missing >= 0) { S.toast(`Answer question ${missing + 1} first`); S.$(`[data-qi="${missing}"]`, qs).scrollIntoView({ block: 'center' }); return; }
      qs.dataset.done = '1';
      let right = 0;
      p.questions.forEach((q, i) => {
        const ok = picks[i] === q.ans;
        if (ok) right++;
        const sec = S.$(`[data-qi="${i}"]`, qs);
        S.$$('[data-pick]', sec).forEach((x) => {
          const k = +x.dataset.pick.split(':')[1];
          x.disabled = true;
          x.classList.toggle('correct', k === q.ans);
          x.classList.toggle('wrong', k === picks[i] && !ok);
        });
        const fb = S.$('[data-fb]', sec);
        fb.className = `feedback ${ok ? 'good' : 'bad'}`;
        fb.innerHTML = `${ok ? '<b>Correct.</b>' : `<b>Answer:</b> <span lang="ja">${esc(q.opts[q.ans])}</span>`}${q.exp ? ` <span class="muted" lang="ja">— ${esc(q.exp)}</span>` : ''}`;
      });
      const pct = S.pct(right, p.questions.length);
      S.store.scores.add('Reading', right, p.questions.length, p.id);
      if (pct >= 80) S.confetti();
      S.$('[data-submit]', qs).remove();
      const res = S.$('[data-result]', qs);
      res.hidden = false;
      res.innerHTML = `<div class="result-head">${S.ui.ring(pct, { size: 88, stroke: 8, tone: S.ui.scoreTone(pct) })}
        <div><h2>${right} / ${p.questions.length}</h2><p class="lead">${pct === 100 ? 'Perfect comprehension!' : pct >= 60 ? 'Nice reading — check any you missed.' : 'Re-read the passage and try again.'}</p>
        <div class="row gap"><button class="btn" data-retry>${S.icon('refresh')} Try again</button><a class="btn primary" href="#/reading">More passages</a></div></div></div>`;
      res.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  S.view('reading', {
    state: { topic: 'all', level: 'all' },
    render(root, { params }) {
      const p = params[0] && S.readingPassages().find((x) => x.id === params[0]);
      if (p) test(root, p); else list(root, this.state);
    },
  });
})(window.S);
