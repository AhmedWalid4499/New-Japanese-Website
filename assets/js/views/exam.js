// Mock exam — a full JLPT N5-style test in three timed sections, scored like the real thing
// (Language knowledge & reading 0–120, Listening 0–60, pass = 80/180 with section minimums),
// plus the original quick 30-question test.
(function (S) {
  const esc = S.esc;
  const QUICK = { per: 10, minutes: 35, pass: 60 };
  const isJp = (s) => /[ぁ-んァ-ン一-龯]/.test(String(s));

  // ── Question pools ──
  const courseQs = () => (typeof GRAMMAR_COURSE !== 'undefined' ? GRAMMAR_COURSE : []).flatMap((m) => m.quiz.filter((q) => isJp(q.q) && q.q.includes('＿')).map((q) => ({ q: q.q, opts: q.opts, ans: q.ans, exp: q.exp })));
  const readingPool = () => [
    ...READING_TESTS.map((t, i) => ({ id: `r${i}`, title: t.title, passage: t.passage, questions: t.questions })),
    ...COMP_PASSAGES.map((p) => ({ id: p.id, title: p.title, passage: p.passage, questions: p.questions })),
  ];
  const mc = (q, part, extra = {}) => ({ part, prompt: q.q, options: q.opts, answer: q.ans, explain: q.exp || '', ...extra });

  function buildFull() {
    const ex = (t) => EXAM_QUESTIONS.filter((q) => q.type === t);
    const vocab = [...S.sample(ex('kanji'), 8), ...S.sample(ex('vocab'), 8)].map((q) => mc(q, 'vocab'));
    const grammar = S.sample([...ex('grammar'), ...courseQs()], 14).map((q) => mc(q, 'grammar'));
    const reading = S.sample(readingPool(), 2).flatMap((p) => p.questions.slice(0, 3).map((q) => mc(q, 'reading', { passage: p })));
    const listening = S.sample(typeof DIALOGUES !== 'undefined' ? DIALOGUES : [], 4).flatMap((d) => d.questions.map((q) => mc(q, 'listening', { dialogue: d })));
    return [
      { id: 'moji', title: 'Vocabulary', jp: 'もじ・ごい', minutes: 20, questions: vocab, desc: 'Kanji readings, word meanings and the right word for the context.' },
      { id: 'bunpou', title: 'Grammar & reading', jp: 'ぶんぽう・どっかい', minutes: 40, questions: [...grammar, ...reading], desc: 'Fill in the grammar, then read two short passages.' },
      { id: 'choukai', title: 'Listening', jp: 'ちょうかい', minutes: 30, questions: listening, desc: 'Each conversation can be played twice. The text is hidden — just like the real test.' },
    ];
  }

  // Real JLPT scaling: 120 points for language knowledge + reading, 60 for listening
  function scoreFull(sections, answers) {
    const ratio = (qs) => (qs.length ? qs.filter((q) => answers.get(q) === q.answer).length / qs.length : 0);
    const lk = [...sections[0].questions, ...sections[1].questions];
    const lkScore = Math.round(ratio(lk) * 120), liScore = Math.round(ratio(sections[2].questions) * 60);
    const total = lkScore + liScore;
    return { lkScore, liScore, total, pass: total >= 80 && lkScore >= 38 && liScore >= 19 };
  }

  function intro(root) {
    const past = S.store.scores.list();
    const fulls = past.filter((s) => s.type === 'JLPT Mock');
    const best = fulls.reduce((m, s) => Math.max(m, s.score), 0);
    const quickBest = past.filter((s) => /^mock exam$/i.test(s.type)).reduce((m, s) => Math.max(m, s.pct), 0);
    const secs = buildFull();
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Mock exam', jp: 'もぎしけん', desc: 'Test yourself under real conditions. The full mock follows the JLPT N5 format and scoring, so you can see if you would pass today.' })}
      <section class="card exam-intro">
        <h2 class="card-title"><span class="glyph sm" lang="ja">試</span> Full JLPT N5 mock</h2>
        <div class="exam-sections">${secs.map((s, i) => `<div class="exam-sec"><span class="exam-sec-n">${i + 1}</span><b>${esc(s.title)}</b><span class="muted small" lang="ja">${esc(s.jp)}</span><span class="small">${s.questions.length} questions · ${s.minutes} min</span></div>`).join('')}</div>
        <ul class="checklist">
          <li>Scored like the real JLPT: <b>language knowledge & reading out of 120</b>, <b>listening out of 60</b>.</li>
          <li>To pass you need <b>80 / 180</b> overall <i>and</i> at least 38 and 19 in the two parts.</li>
          <li>Each section has its own timer. You can move between questions and change answers until you submit the section.</li>
          <li>Questions are drawn at random, so every attempt is different.${S.ai.useVoice() ? ' Listening uses ChatGPT voices.' : ''}</li>
        </ul>
        ${fulls.length ? `<p class="muted">Attempts: ${fulls.length} · best score <b>${best} / 180</b></p>` : ''}
        <button class="btn primary lg" data-full>${S.icon('play')} Start full mock (90 min)</button>
      </section>
      <section class="card">
        <h2 class="card-title"><span class="glyph sm" lang="ja">速</span> Quick test</h2>
        <p class="muted">${QUICK.per * 3} questions (grammar, kanji, vocabulary) in ${QUICK.minutes} minutes, with an explanation after each answer.${quickBest ? ` Best: <b>${quickBest}%</b>.` : ''}</p>
        <button class="btn" data-quick>${S.icon('play')} Start quick test</button>
      </section>`;
    S.$('[data-full]', root).addEventListener('click', () => runFull(root, secs));
    S.$('[data-quick]', root).addEventListener('click', () => quick(root));
  }

  function quick(root) {
    const make = () => [['grammar', 'Grammar'], ['kanji', 'Kanji'], ['vocab', 'Vocabulary']].flatMap(([type, label]) =>
      S.sample(EXAM_QUESTIONS.filter((q) => q.type === type), QUICK.per).map((q) => ({ prompt: q.q, options: q.opts, answer: q.ans, explain: q.exp, tag: label })));
    const stage = document.createElement('div');
    stage.className = 'quiz-stage';
    root.replaceChildren(stage);
    window.scrollTo(0, 0);
    S.quiz.run(stage, { title: 'Quick test', scoreType: 'Mock Exam', questions: make(), makeQuestions: make, totalTime: QUICK.minutes * 60, autoAdvance: false, passMark: QUICK.pass, onExit: () => intro(root) });
  }

  function runFull(root, sections) {
    // shuffle options once
    sections.forEach((s) => { s.questions = s.questions.map((q) => { const o = S.shuffle(q.options.map((_, i) => i)); return { ...q, options: o.map((i) => q.options[i]), answer: o.indexOf(q.answer) }; }); });
    const answers = new Map();
    const plays = new Map(); // dialogue id → times played
    let si = 0, qi = 0, left = 0, timer = null, stopAudio = null;
    const leave = () => { clearInterval(timer); stopAudio && stopAudio(); };
    S.onLeave(leave);

    const sectionStart = () => {
      const s = sections[si];
      leave();
      window.scrollTo(0, 0);
      root.innerHTML = `<section class="card center hero-card exam-break">
        <div class="kicker">Section ${si + 1} of ${sections.length}</div>
        <h2>${esc(s.title)} <span class="muted" lang="ja">${esc(s.jp)}</span></h2>
        <p class="muted">${esc(s.desc)}</p>
        <p><b>${s.questions.length} questions · ${s.minutes} minutes</b></p>
        <button class="btn primary lg" data-begin>${S.icon('play')} Begin section</button></section>`;
      S.$('[data-begin]', root).addEventListener('click', () => {
        qi = 0; left = s.minutes * 60;
        timer = setInterval(() => { left--; const t = S.$('[data-clock]', root); if (t) { t.textContent = clock(left); t.classList.toggle('low', left < 120); } if (left <= 0) submitSection(true); }, 1000);
        show();
      });
    };
    const clock = (n) => `${Math.floor(Math.max(0, n) / 60)}:${String(Math.max(0, n) % 60).padStart(2, '0')}`;

    const show = () => {
      const s = sections[si], q = s.questions[qi];
      stopAudio && stopAudio(); stopAudio = null;
      const sameGroup = (a, b) => (a.passage && a.passage === b.passage) || (a.dialogue && a.dialogue === b.dialogue);
      root.innerHTML = `
        <div class="exam-run">
          <div class="exam-top"><b>${esc(s.title)}</b><span class="spacer"></span><span class="exam-clock" data-clock>${clock(left)}</span>
            <button class="btn sm" data-submit>Submit section</button></div>
          <div class="exam-dots">${s.questions.map((x, k) => `<button class="exam-dot ${k === qi ? 'on' : ''} ${answers.has(x) ? 'done' : ''}" data-jump="${k}">${k + 1}</button>`).join('')}</div>
          <section class="card exam-q">
            ${q.passage ? `<div class="exam-passage"><div class="kicker">Read the passage</div><h3 lang="ja">${esc(q.passage.title)}</h3><p lang="ja">${esc(q.passage.passage)}</p></div>` : ''}
            ${q.dialogue ? `<div class="exam-listen"><div class="kicker">Listen</div><p class="muted">${esc(q.dialogue.scene)}</p>
              <button class="btn primary" data-play ${(plays.get(q.dialogue.id) || 0) >= 2 ? 'disabled' : ''}>${S.icon('play')} Play conversation</button>
              <span class="muted small" data-plays>${2 - (plays.get(q.dialogue.id) || 0)} play${2 - (plays.get(q.dialogue.id) || 0) === 1 ? '' : 's'} left</span>
              <div class="muted small">Other questions on this conversation: ${s.questions.map((x, k) => (k !== qi && sameGroup(x, q) ? k + 1 : null)).filter(Boolean).join(', ') || 'none'}</div></div>` : ''}
            <div class="exam-prompt" ${isJp(q.prompt) ? 'lang="ja"' : ''}><span class="muted">${qi + 1}.</span> ${esc(q.prompt)}</div>
            <div class="options">${q.options.map((o, k) => `<button class="option ${answers.get(q) === k ? 'selected' : ''}" data-k="${k}" ${isJp(o) ? 'lang="ja"' : ''}><span class="opt-letter">${k + 1}</span>${esc(o)}</button>`).join('')}</div>
          </section>
          <div class="row gap"><button class="btn" data-prev ${qi ? '' : 'disabled'}>${S.icon('left')} Back</button><span class="spacer"></span>
            ${qi + 1 < s.questions.length ? `<button class="btn primary" data-next>Next ${S.icon('right')}</button>` : '<button class="btn primary" data-submit>Submit section</button>'}</div>
        </div>`;
      root.onclick = (e) => {
        const o = e.target.closest('[data-k]');
        if (o) { answers.set(q, +o.dataset.k); S.$$('[data-k]', root).forEach((b) => b.classList.toggle('selected', b === o)); S.$(`[data-jump="${qi}"]`, root).classList.add('done'); return; }
        const j = e.target.closest('[data-jump]');
        if (j) { qi = +j.dataset.jump; show(); return; }
        if (e.target.closest('[data-next]')) { qi++; show(); return; }
        if (e.target.closest('[data-prev]')) { qi--; show(); return; }
        if (e.target.closest('[data-submit]')) { submitSection(false); return; }
        const p = e.target.closest('[data-play]');
        if (p && q.dialogue) {
          const n = (plays.get(q.dialogue.id) || 0) + 1;
          plays.set(q.dialogue.id, n);
          p.disabled = true;
          S.$('[data-plays]', root).textContent = 'Playing…';
          stopAudio = S.playDialogue(q.dialogue, { onLine: (i) => { if (i < 0) { const pl = S.$('[data-plays]', root); if (pl) pl.textContent = `${2 - n} play${2 - n === 1 ? '' : 's'} left`; const b = S.$('[data-play]', root); if (b) b.disabled = n >= 2; } } });
        }
      };
    };

    const submitSection = (timeUp) => {
      const s = sections[si];
      const unanswered = s.questions.filter((q) => !answers.has(q)).length;
      if (!timeUp && unanswered && !S.confirm(`${unanswered} question${unanswered > 1 ? 's are' : ' is'} unanswered. Submit this section anyway?`)) return;
      leave();
      if (timeUp) S.toast('Time’s up for this section');
      si++;
      if (si < sections.length) sectionStart(); else results();
    };

    const results = () => {
      root.onclick = null;
      const r = scoreFull(sections, answers);
      S.store.scores.add('JLPT Mock', r.total, 180);
      if (r.pass) S.confetti();
      const parts = [['vocab', 'Vocabulary'], ['grammar', 'Grammar'], ['reading', 'Reading'], ['listening', 'Listening']].map(([p, label]) => {
        const qs = sections.flatMap((s) => s.questions).filter((q) => q.part === p);
        return { label, got: qs.filter((q) => answers.get(q) === q.answer).length, total: qs.length };
      });
      const wrong = sections.flatMap((s) => s.questions).filter((q) => answers.get(q) !== q.answer);
      window.scrollTo(0, 0);
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Mock exam', title: r.pass ? '合格 — you passed!' : 'Not quite a pass yet', desc: r.pass ? 'At this level you would pass the JLPT N5. 頑張りましたね！' : 'Look at the weakest part below and focus your study there.' })}
        <section class="card jlpt-score">
          <div class="jlpt-total ${r.pass ? 'pass' : ''}"><span class="hanko-lg" lang="ja">${r.pass ? '合格' : '不合格'}</span><b>${r.total}</b><span>/ 180</span><small>pass mark 80</small></div>
          <div class="jlpt-parts">
            <div><span>Language knowledge & reading</span><b>${r.lkScore} / 120</b>${S.ui.bar(S.pct(r.lkScore, 120), r.lkScore >= 38 ? 'good' : 'bad')}<small class="muted">minimum 38</small></div>
            <div><span>Listening</span><b>${r.liScore} / 60</b>${S.ui.bar(S.pct(r.liScore, 60), r.liScore >= 19 ? 'good' : 'bad')}<small class="muted">minimum 19</small></div>
          </div>
        </section>
        <section class="card"><h2 class="card-title">By skill</h2><div class="stat-row">${parts.map((p) => `<div class="stat"><b>${p.got}/${p.total}</b><span>${p.label}</span></div>`).join('')}</div>
          <div class="row gap wrap"><a class="btn" href="#/course">${S.icon('book')} Grammar course</a><a class="btn" href="#/dialogues">${S.icon('volume')} Dialogues</a><a class="btn" href="#/stories">${S.icon('book')} Stories</a><button class="btn primary" data-again>${S.icon('refresh')} New mock exam</button></div></section>
        ${wrong.length ? `<section class="card"><h2 class="card-title">Review your mistakes <span class="muted">${wrong.length}</span></h2>
          <ol class="miss-list">${wrong.map((q) => `<li><div ${isJp(q.prompt) ? 'lang="ja"' : ''}>${esc(q.prompt)}${q.dialogue ? ` <span class="muted small">(${esc(q.dialogue.title)})</span>` : ''}${q.passage ? ` <span class="muted small" lang="ja">(${esc(q.passage.title)})</span>` : ''}</div>
            <div><span class="good-text" ${isJp(q.options[q.answer]) ? 'lang="ja"' : ''}>${esc(q.options[q.answer])}</span>${answers.has(q) ? ` <span class="muted small">· you chose ${esc(q.options[answers.get(q)])}</span>` : ' <span class="muted small">· unanswered</span>'}</div>
            ${q.explain ? `<div class="muted small">${esc(q.explain)}</div>` : ''}</li>`).join('')}</ol></section>` : ''}`;
      S.$('[data-again]', root).addEventListener('click', () => intro(root));
    };

    sectionStart();
  }

  S.view('exam', { render(root) { root.onclick = null; intro(root); } });
})(window.S);
