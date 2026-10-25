// Writing — translate English prompts into Japanese, then compare with a model answer.
(function (S) {
  const esc = S.esc;
  const PER_ROUND = 8;

  function intro(root) {
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Writing', jp: 'さくぶん', desc: 'Translate each sentence into Japanese (kana is fine), check it against the model answer, and rate yourself honestly.' })}
      <section class="card center hero-card">
        <div class="glyph huge" lang="ja">書</div>
        <h2>${PER_ROUND} random sentences</h2>
        <p class="muted">Drawn from a pool of ${WRITING_ITEMS.length}. Each comes with a grammar hint after you check.</p>
        <button class="btn primary" data-start>${S.icon('play')} Start writing</button>
      </section>`;
    S.$('[data-start]', root).addEventListener('click', () => round(root));
  }

  function round(root) {
    const items = S.sample(WRITING_ITEMS, PER_ROUND);
    const ratings = {};
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Writing', title: 'Translate into Japanese', actions: `<button class="btn ghost" data-quit>${S.icon('left')} Back</button>` })}
      <div class="stack" data-items>${items.map((it, i) => `
        <section class="card writing" data-i="${i}">
          <div class="kicker">Sentence ${i + 1} of ${items.length}</div>
          <h3 class="writing-prompt">${esc(it.en)}</h3>
          <textarea class="writing-input" lang="ja" rows="2" placeholder="Write in Japanese…" aria-label="Your answer"></textarea>
          <div class="row gap"><button class="btn sm" data-check>${S.icon('eye')} Check</button></div>
          <div class="model" hidden>
            <div class="muted small">Model answer</div>
            <div class="model-jp" lang="ja">${esc(it.jp)} ${S.ui.speak(it.jp)}</div>
            <div class="callout">${esc(it.note)}</div>
            <div class="rate"><span class="muted small">How did you do?</span>
              <button class="btn sm grade good" data-rate="2">Got it</button>
              <button class="btn sm grade" data-rate="1">Almost</button>
              <button class="btn sm grade again" data-rate="0">Missed</button></div>
          </div>
        </section>`).join('')}
        <div class="card result" data-result hidden></div>
        <button class="btn primary block" data-finish>Finish & see score</button>
      </div>`;

    const wrap = S.$('[data-items]', root);
    wrap.addEventListener('click', (e) => {
      const sec = e.target.closest('[data-i]');
      if (e.target.closest('[data-check]') && sec) { S.$('.model', sec).hidden = false; e.target.closest('[data-check]').remove(); }
      const r = e.target.closest('[data-rate]');
      if (r && sec) { ratings[sec.dataset.i] = +r.dataset.rate; S.$$('[data-rate]', sec).forEach((b) => b.classList.toggle('chosen', b === r)); }
      if (e.target.closest('[data-finish]')) finish();
    });
    S.$('[data-quit]', root).addEventListener('click', () => intro(root));

    function finish() {
      const unrated = items.findIndex((_, i) => ratings[i] == null);
      if (unrated >= 0) {
        const sec = S.$(`[data-i="${unrated}"]`, wrap);
        S.$('.model', sec).hidden = false; S.$('[data-check]', sec)?.remove();
        sec.scrollIntoView({ block: 'center' });
        S.toast(`Rate sentence ${unrated + 1} first`);
        return;
      }
      const got = Object.values(ratings).filter((r) => r === 2).length;
      const almost = Object.values(ratings).filter((r) => r === 1).length;
      S.store.scores.add('Writing', got, items.length);
      const pct = S.pct(got, items.length);
      if (pct >= 80) S.confetti();
      S.$('[data-finish]', wrap).remove();
      const res = S.$('[data-result]', wrap);
      res.hidden = false;
      res.innerHTML = `<div class="result-head">${S.ui.ring(pct, { size: 88, stroke: 8, tone: S.ui.scoreTone(pct) })}
        <div><h2>${got} of ${items.length} spot on</h2><p class="lead">${almost ? `${almost} almost there. ` : ''}${pct >= 75 ? 'Great writing!' : 'Writing takes time — every attempt counts.'}</p>
        <div class="row gap"><button class="btn primary" data-again>${S.icon('refresh')} New sentences</button></div></div></div>`;
      S.$('[data-again]', res).addEventListener('click', () => round(root));
      res.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  S.view('writing', { render(root) { intro(root); } });
})(window.S);
