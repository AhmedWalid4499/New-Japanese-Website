// Mock exam — 10 grammar + 10 kanji + 10 vocabulary questions in 35 minutes.
(function (S) {
  const SECTIONS = [['grammar', 'Grammar', '文'], ['kanji', 'Kanji', '漢'], ['vocab', 'Vocabulary', '語']];
  const PER_SECTION = 10, MINUTES = 35, PASS = 60;

  const makeQuestions = () => SECTIONS.flatMap(([type, label]) =>
    S.sample(EXAM_QUESTIONS.filter((q) => q.type === type), PER_SECTION)
      .map((q) => ({ prompt: q.q, options: q.opts, answer: q.ans, explain: q.exp, tag: label })));

  function intro(root) {
    const past = S.store.scores.list().filter((s) => /mock exam/i.test(s.type));
    const best = past.reduce((m, s) => Math.max(m, s.pct), 0);
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Mock exam', jp: 'もぎしけん', desc: 'A timed test in the style of the JLPT N5 language-knowledge section. Treat it like the real thing — no peeking at notes!' })}
      <section class="card exam-intro">
        <div class="stat-row">${SECTIONS.map(([type, label, g]) => `<div class="stat"><span class="glyph" lang="ja">${g}</span><b>${PER_SECTION}</b><span>${label}</span></div>`).join('')}
          <div class="stat"><span class="glyph">${S.icon('clock')}</span><b>${MINUTES}</b><span>minutes</span></div></div>
        <ul class="checklist">
          <li>Questions are drawn at random from a pool of ${EXAM_QUESTIONS.length}, so every attempt is different.</li>
          <li>You’ll see the explanation after each answer. Unanswered questions count as wrong when time runs out.</li>
          <li>Aim for <b>${PASS}%</b> or more — roughly the level needed to pass.</li>
        </ul>
        ${past.length ? `<p class="muted">You’ve taken this ${past.length} time${past.length > 1 ? 's' : ''}. Best score: <b>${best}%</b>.</p>` : ''}
        <button class="btn primary lg" data-start>${S.icon('play')} Start exam</button>
      </section>`;
    S.$('[data-start]', root).addEventListener('click', () => start(root));
  }

  function start(root) {
    const stage = document.createElement('div');
    stage.className = 'quiz-stage';
    root.replaceChildren(stage);
    window.scrollTo(0, 0);
    S.quiz.run(stage, {
      title: 'Mock exam', scoreType: 'Mock Exam', questions: makeQuestions(), makeQuestions,
      totalTime: MINUTES * 60, autoAdvance: false, passMark: PASS, onExit: () => intro(root),
    });
  }

  S.view('exam', { render(root) { intro(root); } });
})(window.S);
