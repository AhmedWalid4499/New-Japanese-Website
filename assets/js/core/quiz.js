// One multiple-choice engine shared by every quiz: kana, kanji, vocab, numbers and the mock exam.
//
// S.quiz.run(root, {
//   title, scoreType,                 // scoreType is the label saved in quiz history
//   questions: [{ prompt, sub, big, options, answer, explain, tag }],
//   timePerQ: 0,                      // seconds per question (0 = untimed)
//   totalTime: 0,                     // seconds for the whole quiz (0 = untimed)
//   autoAdvance: true,                // move on automatically after answering
//   passMark: 0,                      // show pass/fail against this % (0 = hide)
//   onExit,                           // "Back" from results / quit
// })
(function (S) {
  const esc = S.esc;
  const KEYS = ['1', '2', '3', '4', '5', '6'];

  const message = (pct) =>
    pct === 100 ? 'Perfect score — 完璧！' :
    pct >= 80 ? 'Excellent work — すごい！' :
    pct >= 60 ? 'Good job — keep it up!' :
    pct >= 40 ? 'Getting there — review and retry.' :
    'Keep practising — がんばって！';

  function run(root, cfg) {
    const opts = { timePerQ: 0, totalTime: 0, autoAdvance: true, passMark: 0, ...cfg };
    const qs = opts.questions.map((q) => {
      if (q.keepOrder) return { ...q };
      const order = S.shuffle(q.options.map((_, i) => i));
      return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
    });
    let idx = 0, score = 0, answered = false;
    let qTimer = null, totalTimer = null, qLeft = 0, totalLeft = opts.totalTime;
    const results = [];

    const stopTimers = () => { clearInterval(qTimer); clearInterval(totalTimer); };
    const onKey = (e) => {
      if (e.target.matches('input, textarea, select')) return;
      const k = KEYS.indexOf(e.key);
      if (!answered && k >= 0 && k < qs[idx]?.options.length) { e.preventDefault(); choose(k); }
      else if (answered && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); }
    };
    document.addEventListener('keydown', onKey);
    const cleanup = () => { stopTimers(); document.removeEventListener('keydown', onKey); };
    S.onLeave(cleanup);

    if (opts.totalTime) {
      totalTimer = setInterval(() => {
        totalLeft--;
        const t = S.$('[data-total]', root);
        if (t) { t.textContent = S.fmtTime(Math.max(0, totalLeft)); t.classList.toggle('low', totalLeft < 60); }
        if (totalLeft <= 0) finish();
      }, 1000);
    }

    function render() {
      const q = qs[idx];
      answered = false;
      root.innerHTML = `
        <div class="quiz card">
          <div class="quiz-top">
            <span class="quiz-count">Question ${idx + 1} <span class="muted">/ ${qs.length}</span></span>
            ${q.tag ? S.ui.badge(q.tag, 'soft') : ''}
            <span class="spacer"></span>
            ${opts.totalTime ? `<span class="timer" title="Time left">${S.icon('clock')}<b data-total>${S.fmtTime(totalLeft)}</b></span>` : ''}
            ${opts.timePerQ ? `<span class="timer" title="Time for this question">${S.icon('clock')}<b data-qtime>${opts.timePerQ}s</b></span>` : ''}
            <button class="btn ghost sm" data-quit>Quit</button>
          </div>
          ${S.ui.bar(S.pct(idx, qs.length))}
          ${opts.timePerQ ? `<div class="qtime-bar"><span data-qbar></span></div>` : ''}
          <div class="quiz-prompt ${q.big ? 'big' : ''}" lang="${q.big ? 'ja' : ''}">${esc(q.prompt)}</div>
          ${q.sub ? `<div class="quiz-sub">${esc(q.sub)}</div>` : ''}
          <div class="options ${q.options.every((o) => String(o).length <= 6) ? 'compact' : ''}">
            ${q.options.map((o, i) => `<button class="option" data-opt="${i}"><kbd>${i + 1}</kbd><span lang="ja">${esc(o)}</span></button>`).join('')}
          </div>
          <div class="feedback" data-feedback aria-live="polite"></div>
          <div class="quiz-actions"><button class="btn primary" data-next hidden>${idx + 1 < qs.length ? 'Next' : 'See results'} ${S.icon('arrow')}</button></div>
        </div>`;
      S.$$('[data-opt]', root).forEach((b) => b.addEventListener('click', () => choose(+b.dataset.opt)));
      S.$('[data-next]', root).addEventListener('click', next);
      S.$('[data-quit]', root).addEventListener('click', () => {
        if (idx === 0 || S.confirm('Quit this quiz? Your progress in it will be lost.')) { cleanup(); opts.onExit && opts.onExit(); }
      });
      if (opts.timePerQ) startQTimer();
    }

    function startQTimer() {
      clearInterval(qTimer);
      qLeft = opts.timePerQ;
      const bar = S.$('[data-qbar]', root);
      if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; requestAnimationFrame(() => { bar.style.transition = `width ${opts.timePerQ}s linear`; bar.style.width = '0%'; }); }
      qTimer = setInterval(() => {
        qLeft--;
        const t = S.$('[data-qtime]', root);
        if (t) { t.textContent = `${Math.max(0, qLeft)}s`; t.classList.toggle('low', qLeft <= 5); }
        if (qLeft <= 0) { clearInterval(qTimer); choose(-1); }
      }, 1000);
    }

    function choose(i) {
      if (answered) return;
      answered = true;
      clearInterval(qTimer);
      const q = qs[idx];
      const ok = i === q.answer;
      if (ok) score++;
      results.push({ q, chosen: i, ok });
      S.$$('[data-opt]', root).forEach((b) => {
        const n = +b.dataset.opt;
        b.disabled = true;
        if (n === q.answer) b.classList.add('correct');
        else if (n === i) b.classList.add('wrong');
      });
      const fb = S.$('[data-feedback]', root);
      fb.className = `feedback ${ok ? 'good' : 'bad'}`;
      fb.innerHTML = `${ok ? S.icon('check') + '<b>Correct!</b>' : `<b>${i < 0 ? "Time's up." : 'Not quite.'}</b> Answer: <span lang="ja">${esc(q.options[q.answer])}</span>`}${q.explain ? ` <span class="muted">— ${esc(q.explain)}</span>` : ''}`;
      if (opts.autoAdvance && !q.explain) setTimeout(() => { if (answered && results.length === idx + 1) next(); }, ok ? 900 : 1700);
      else { const n = S.$('[data-next]', root); n.hidden = false; n.focus(); }
    }

    function next() {
      if (!answered) return;
      idx++;
      if (idx >= qs.length) finish(); else render();
    }

    function finish() {
      if (root.dataset.done) return;
      root.dataset.done = '1';
      cleanup();
      // unanswered questions (time ran out) count as wrong
      for (let k = results.length; k < qs.length; k++) results.push({ q: qs[k], chosen: -1, ok: false });
      const pct = S.pct(score, qs.length);
      if (opts.scoreType) S.store.scores.add(opts.scoreType, score, qs.length);
      if (pct >= 80) S.confetti(pct === 100 ? 4000 : 2600);

      const tags = S.uniq(results.map((r) => r.q.tag).filter(Boolean));
      const breakdown = tags.length > 1 ? `<div class="breakdown">${tags.map((t) => {
        const rs = results.filter((r) => r.q.tag === t);
        const ok = rs.filter((r) => r.ok).length;
        return `<div class="breakdown-row"><span>${esc(t)}</span>${S.ui.bar(S.pct(ok, rs.length), S.ui.scoreTone(S.pct(ok, rs.length)))}<b>${ok}/${rs.length}</b></div>`;
      }).join('')}</div>` : '';
      const missed = results.filter((r) => !r.ok);

      root.innerHTML = `
        <div class="card result">
          <div class="result-head">
            ${S.ui.ring(pct, { size: 112, stroke: 10, tone: S.ui.scoreTone(pct) })}
            <div>
              <div class="kicker">${esc(opts.title || 'Quiz')} complete</div>
              <h2>${score} / ${qs.length} correct</h2>
              <p class="lead">${esc(message(pct))}</p>
              ${opts.passMark ? `<p>${pct >= opts.passMark ? S.ui.badge('Pass level reached', 'good') : S.ui.badge(`Aim for ${opts.passMark}%+ to pass`, 'warn')}</p>` : ''}
            </div>
          </div>
          ${breakdown}
          ${missed.length ? `<details class="review" ${missed.length <= 5 ? 'open' : ''}><summary>Review ${missed.length} missed question${missed.length > 1 ? 's' : ''}</summary>
            <ul class="review-list">${missed.map((r) => `<li>
              <div class="review-q" lang="ja">${esc(r.q.prompt)}</div>
              <div class="review-a"><span class="bad-text">${r.chosen < 0 ? 'No answer' : esc(r.q.options[r.chosen])}</span> → <b class="good-text" lang="ja">${esc(r.q.options[r.q.answer])}</b></div>
              ${r.q.explain ? `<div class="muted small">${esc(r.q.explain)}</div>` : ''}</li>`).join('')}</ul></details>` : ''}
          <div class="row gap">
            <button class="btn primary" data-again>${S.icon('refresh')} Try again</button>
            <button class="btn" data-back>Back</button>
          </div>
        </div>`;
      S.$('[data-again]', root).addEventListener('click', () => {
        delete root.dataset.done;
        run(root, cfg.makeQuestions ? { ...cfg, questions: cfg.makeQuestions() } : cfg);
      });
      S.$('[data-back]', root).addEventListener('click', () => opts.onExit && opts.onExit());
    }

    delete root.dataset.done;
    render();
    return cleanup;
  }

  // Build N questions from a pool: correct = getAnswer(item), distractors from other items.
  function build(pool, n, { prompt, answer, sub, big, tag, distractorPool }) {
    const source = distractorPool || pool;
    return S.sample(pool, Math.min(n, pool.length)).map((item) => {
      const correct = answer(item);
      const wrong = S.shuffle(S.uniq(source.map(answer).filter((a) => a && a !== correct))).slice(0, 3);
      return {
        prompt: prompt(item), sub: sub ? sub(item) : '', big: typeof big === 'function' ? big(item) : !!big,
        options: [correct, ...wrong], answer: 0, tag: tag ? tag(item) : '',
      };
    });
  }

  S.quiz = { run, build };
})(window.S);
