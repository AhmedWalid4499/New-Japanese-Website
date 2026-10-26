// Grammar course — step-by-step N5 lessons: explanation, formulas, examples, common mistakes and a quiz.
(function (S) {
  const esc = S.esc;
  const PASS = 4; // quiz answers (of 5) needed to complete a lesson

  const progress = () => S.store.read(S.store.KEYS.course, {});
  const saveResult = (id, score) => {
    const p = progress();
    const prev = p[id] || {};
    p[id] = { best: Math.max(prev.best || 0, score), done: !!prev.done || score >= PASS, date: new Date().toISOString() };
    S.store.write(S.store.KEYS.course, p);
    S.store.activity.log(1);
    return p[id];
  };
  const doneCount = () => { const p = progress(); return GRAMMAR_COURSE.filter((m) => p[m.id]?.done).length; };
  const nextModule = () => { const p = progress(); return GRAMMAR_COURSE.find((m) => !p[m.id]?.done) || null; };

  S.course = {
    progress, doneCount, nextModule,
    summary: () => {
      const n = nextModule();
      return `Grammar course: ${doneCount()}/${GRAMMAR_COURSE.length} lessons done${n ? `; next lesson “${n.title}”` : ''}.`;
    },
  };

  const md = (t) => S.ai.render(t);
  const unitOf = (m) => COURSE_UNITS.find((u) => u.n === m.unit) || COURSE_UNITS[0];

  function overview(root) {
    const p = progress();
    const done = doneCount(), total = GRAMMAR_COURSE.length;
    const next = nextModule();
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Learn', title: 'Grammar course', jp: 'ぶんぽう', desc: `${total} step-by-step lessons that take you through every JLPT N5 grammar point — clear explanations, “how to build it” formulas, examples with audio, common mistakes and a quiz. Score ${PASS}/5 to complete a lesson.` })}
      <section class="card course-summary">
        ${S.ui.ring(S.pct(done, total), { size: 84, stroke: 8 })}
        <div class="grow"><h2>${done} of ${total} lessons complete</h2>
          <p class="muted">${next ? `Up next: <b>Lesson ${next.n} · ${esc(next.title)}</b>` : 'You’ve finished the whole course — おめでとう！ Try the mock exam next.'}</p></div>
        ${next ? `<a class="btn primary lg" href="#/course/${esc(next.id)}">${S.icon('play')} ${done ? 'Continue' : 'Start lesson 1'}</a>` : '<a class="btn primary lg" href="#/exam">Take the mock exam</a>'}
      </section>
      ${COURSE_UNITS.map((u) => {
        const mods = GRAMMAR_COURSE.filter((m) => m.unit === u.n);
        if (!mods.length) return '';
        const ud = mods.filter((m) => p[m.id]?.done).length;
        return `<section class="section-block course-unit" style="--unit:${u.color}">
          <h2 class="section-title"><span class="unit-badge">Unit ${u.n}</span> ${esc(u.title)} <span class="muted" lang="ja">${esc(u.jp)}</span><span class="spacer"></span><span class="muted small">${ud}/${mods.length}</span></h2>
          <div class="module-grid">${mods.map((m) => {
            const r = p[m.id];
            return `<a class="module-card ${r?.done ? 'done' : ''} ${next && next.id === m.id ? 'next' : ''}" href="#/course/${esc(m.id)}">
              <span class="module-n">${r?.done ? S.icon('check') : m.n}</span>
              <span class="module-text"><b>${esc(m.title)}</b><small>${esc(m.summary)}</small></span>
              ${r ? `<span class="module-score">${r.best}/5</span>` : ''}
            </a>`;
          }).join('')}</div></section>`;
      }).join('')}
      ${!total ? S.ui.empty('Course content missing', 'The lesson files didn’t load. Try reloading the page.') : ''}`;
  }

  function lesson(root, m) {
    const u = unitOf(m);
    const idx = GRAMMAR_COURSE.indexOf(m);
    const prev = GRAMMAR_COURSE[idx - 1], next = GRAMMAR_COURSE[idx + 1];
    const r = progress()[m.id];
    const romaji = S.store.settings.get('romaji') !== false;
    const ask = `I’m studying the grammar lesson “${m.title}”. Explain it to me again in a different way with new simple examples, then give me 3 short English sentences to translate into Japanese using it.`;

    root.innerHTML = `
      <nav class="lesson-nav"><a class="btn ghost sm" href="#/course">${S.icon('left')} All lessons</a><span class="muted small">Lesson ${m.n} of ${GRAMMAR_COURSE.length}</span></nav>
      <header class="page-head course-head" style="--unit:${u.color}">
        <div class="page-head-text">
          <div class="kicker"><span class="unit-badge">Unit ${u.n} · ${esc(u.title)}</span></div>
          <h1>${esc(m.title)}</h1>
          <p class="lead">${esc(m.summary)}</p>
        </div>
        <div class="page-head-actions">
          ${r?.done ? `<span class="badge good">${S.icon('check')} Completed</span>` : ''}
          ${S.ui.bm(`course_${m.id}`, { type: 'grammar', label: m.title, detail: m.summary })}
        </div>
      </header>

      <section class="card">
        <h2 class="card-title"><span class="glyph sm" lang="ja">式</span> How to build it</h2>
        <div class="formulas">${m.formulas.map((f) => `<div class="formula"><span class="formula-label">${esc(f.label)}</span><span class="formula-f" lang="ja">${esc(f.f)}</span></div>`).join('')}</div>
      </section>

      <section class="card prose">
        <h2 class="card-title"><span class="glyph sm" lang="ja">説</span> Explanation</h2>
        ${m.explain.map(md).join('')}
        ${m.table ? `<div class="table-wrap"><table class="table"><thead><tr>${m.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
          <tbody>${m.table.rows.map((row) => `<tr>${row.map((c, i) => `<td ${i ? 'lang="ja"' : 'class="strong"'}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
      </section>

      <section class="card">
        <h2 class="card-title"><span class="glyph sm" lang="ja">例</span> Examples <span class="muted">tap ${S.icon('volume')} to listen</span></h2>
        <ul class="examples">${m.examples.map((ex) => `
          <li class="example">
            <div class="example-jp" lang="ja">${esc(ex.jp)} ${S.ui.speak(ex.jp)}</div>
            ${romaji && ex.rom ? `<div class="example-rom">${esc(ex.rom)}</div>` : ''}
            <div class="example-en">${esc(ex.en)}</div>
            ${ex.note ? `<div class="muted small">${esc(ex.note)}</div>` : ''}
          </li>`).join('')}</ul>
      </section>

      ${m.mistakes?.length ? `<section class="card">
        <h2 class="card-title"><span class="glyph sm" lang="ja">誤</span> Common mistakes</h2>
        <div class="mistakes">${m.mistakes.map((x) => `<div class="mistake">
          <div class="mistake-row bad">${S.icon('x')}<span lang="ja">${esc(x.wrong)}</span></div>
          <div class="mistake-row good">${S.icon('check')}<span lang="ja">${esc(x.right)}</span></div>
          <p class="muted small">${esc(x.why)}</p></div>`).join('')}</div>
      </section>` : ''}

      ${m.tips?.length ? `<div class="callout tips">${m.tips.map((t) => `<p>💡 ${md(t).replace(/^<p>|<\/p>$/g, '')}</p>`).join('')}</div>` : ''}

      <section class="card course-quiz" data-quiz></section>

      <section class="card ask-card">
        <div class="grow"><h3>Still unsure?</h3><p class="muted">Ask Sensei, your Claude-powered tutor, to explain this lesson another way and give you practice sentences.</p></div>
        <button class="btn" data-ask>${S.icon('chat')} Ask Sensei about this</button>
      </section>

      <nav class="lesson-pager">
        ${prev ? `<a class="btn" href="#/course/${esc(prev.id)}">${S.icon('left')} ${esc(prev.short || prev.title)}</a>` : '<span></span>'}
        ${next ? `<a class="btn primary" href="#/course/${esc(next.id)}">${esc(next.short || next.title)} ${S.icon('right')}</a>` : '<a class="btn primary" href="#/exam">Mock exam</a>'}
      </nav>`;

    S.$('[data-ask]', root).addEventListener('click', () => S.askSensei(ask));
    window.scrollTo(0, 0);
    quiz(S.$('[data-quiz]', root), m);
  }

  // Inline 5-question quiz with instant feedback
  function quiz(el, m) {
    const qs = m.quiz.map((q) => {
      const order = S.shuffle(q.opts.map((_, i) => i));
      return { ...q, options: order.map((i) => q.opts[i]), answer: order.indexOf(q.ans) };
    });
    const picked = {};
    const isJp = (s) => /[ぁ-んァ-ン一-龯]/.test(s);
    const paint = () => {
      const n = Object.keys(picked).length;
      const score = qs.filter((q, i) => picked[i] === q.answer).length;
      el.innerHTML = `
        <h2 class="card-title"><span class="glyph sm" lang="ja">問</span> Check yourself <span class="muted">${n}/${qs.length} answered</span></h2>
        <ol class="cq-list">${qs.map((q, i) => {
          const a = picked[i];
          return `<li class="cq">
            <div class="cq-q" ${isJp(q.q) ? 'lang="ja"' : ''}>${esc(q.q)}</div>
            <div class="options inline">${q.options.map((o, k) => `<button class="option sm ${a != null && k === q.answer ? 'correct' : ''} ${a === k && k !== q.answer ? 'wrong' : ''}" data-q="${i}" data-k="${k}" ${a != null ? 'disabled' : ''} ${isJp(o) ? 'lang="ja"' : ''}>${esc(o)}</button>`).join('')}</div>
            ${a != null ? `<div class="feedback ${a === q.answer ? 'good' : 'bad'}">${a === q.answer ? S.icon('check') : S.icon('x')} <span class="muted">${esc(q.exp)}</span></div>` : ''}
          </li>`;
        }).join('')}</ol>
        ${n === qs.length ? `<div class="cq-result ${score >= PASS ? 'pass' : ''}">
          <b>${score}/${qs.length}</b> — ${score === qs.length ? 'Perfect! 完璧！ Lesson complete.' : score >= PASS ? 'Great — lesson complete!' : `You need ${PASS} to complete this lesson. Re-read the explanation and try again.`}
          <button class="btn sm" data-retry>${S.icon('refresh')} Try again</button></div>` : ''}`;
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]');
      if (b) {
        const i = +b.dataset.q;
        if (picked[i] != null) return;
        picked[i] = +b.dataset.k;
        if (isJp(qs[i].options[picked[i]])) S.tts.speak(qs[i].options[picked[i]]);
        if (Object.keys(picked).length === qs.length) {
          const score = qs.filter((q, k) => picked[k] === q.answer).length;
          const before = progress()[m.id]?.done;
          const res = saveResult(m.id, score);
          if (res.done && !before) { S.confetti(); S.toast(`Lesson ${m.n} complete — ${doneCount()}/${GRAMMAR_COURSE.length}`); }
        }
        paint();
        return;
      }
      if (e.target.closest('[data-retry]')) { Object.keys(picked).forEach((k) => delete picked[k]); paint(); el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    });
    paint();
  }

  S.view('course', {
    render(root, { params }) {
      const m = params[0] && GRAMMAR_COURSE.find((x) => x.id === params[0]);
      if (m) lesson(root, m); else overview(root);
    },
  });
})(window.S);
