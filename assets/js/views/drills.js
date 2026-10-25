// Sentence drills — fill in the blank with the right particle, form or pattern.
(function (S) {
  const esc = S.esc;
  const CATS = [['all', 'All'], ['particles', 'Particles'], ['te-form', 'て-form'], ['conjugation', 'Conjugation'], ['patterns', 'Patterns']];

  S.view('drills', {
    render(root) {
      let cat = 'all', answers = {}, orders = {}, saved = false;
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Practice', title: 'Sentence drills', jp: 'れんしゅう', desc: 'Choose what fills the blank. Each question explains the rule after you answer.' })}
        <div class="toolbar sticky">${S.ui.chips('cat', CATS.map(([value, label]) => ({ value, label, count: value === 'all' ? SP_QUESTIONS.length : SP_QUESTIONS.filter((q) => q.cat === value).length })), cat)}
          <div class="score-pill" data-score></div><button class="btn ghost sm" data-reset>${S.icon('refresh')} Reset</button></div>
        <div class="stack" data-list></div>`;
      const list = S.$('[data-list]', root);
      const current = () => SP_QUESTIONS.map((q, i) => ({ q, i })).filter(({ q }) => cat === 'all' || q.cat === cat);

      const paintScore = () => {
        const qs = current();
        const done = qs.filter(({ i }) => answers[i] != null);
        const right = done.filter(({ q, i }) => answers[i] === q.ans).length;
        S.$('[data-score]', root).innerHTML = `<b>${right}</b> / ${done.length} correct · ${qs.length - done.length} left`;
        if (!saved && qs.length && done.length === qs.length) {
          saved = true;
          S.store.scores.add('Sentence Drills', right, qs.length);
          const pct = S.pct(right, qs.length);
          S.toast(`Finished: ${right}/${qs.length} (${pct}%)`);
          if (pct >= 80) S.confetti();
        }
      };

      const paint = () => {
        list.innerHTML = current().map(({ q, i }) => {
          orders[i] = orders[i] || S.shuffle(q.opts.map((_, k) => k));
          const a = answers[i];
          const done = a != null;
          const ok = a === q.ans;
          const full = q.sentence.map((p, k) => (k === q.blank ? q.opts[q.ans] : p)).join('').replace(/ — .*/, '');
          return `<article class="card drill ${done ? (ok ? 'is-good' : 'is-bad') : ''}">
            <div class="drill-sentence" lang="ja">${q.sentence.map((p, k) => (k === q.blank ? `<span class="blank">${done ? esc(q.opts[q.ans]) : '＿＿'}</span>` : esc(p))).join('')}</div>
            <div class="muted">${esc(q.eng)}</div>
            <div class="options inline">${orders[i].map((k) => `<button class="option sm ${done && k === q.ans ? 'correct' : ''} ${done && k === a && !ok ? 'wrong' : ''}" data-q="${i}" data-a="${k}" ${done ? 'disabled' : ''} lang="ja">${esc(q.opts[k])}</button>`).join('')}</div>
            <div class="drill-foot"><span class="${done ? (ok ? 'good-text' : 'bad-text') : 'muted'} small">${done ? (ok ? 'Correct — ' : `Answer: ${esc(q.opts[q.ans])} — `) : 'Hint: '}${esc(q.hint)}</span>${done ? S.ui.speak(full, { slow: false }) : ''}</div>
          </article>`;
        }).join('');
        paintScore();
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { cat = chip.dataset.chip; S.ui.setChip(root, 'cat', cat); saved = false; paint(); return; }
        if (e.target.closest('[data-reset]')) { answers = {}; orders = {}; saved = false; paint(); return; }
        const b = e.target.closest('[data-q]');
        if (b && answers[b.dataset.q] == null) { answers[b.dataset.q] = +b.dataset.a; paint(); }
      });
      paint();
    },
  });
})(window.S);
