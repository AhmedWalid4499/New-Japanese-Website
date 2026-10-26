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
        ${S.ai.hasChat() ? '<p class="muted small">Sensei (Claude) can check every answer — any correct way of saying it counts.</p>' : '<p class="muted small"><a href="#/account?ai=1">Add a Claude key</a> to have Sensei check your answers.</p>'}
      </section>
      <section class="section-block"><h2 class="section-title">Free writing <span class="muted">corrected by Sensei</span></h2>
        <div class="tile-grid">${DIARY_PROMPTS.map((p, i) => `<button class="tile" data-diary="${i}"><span class="glyph" lang="ja">${p.glyph}</span><span><b>${esc(p.title)}</b><small>${esc(p.hint)}</small></span></button>`).join('')}</div>
      </section>`;
    S.$('[data-start]', root).addEventListener('click', () => round(root));
    S.$$('[data-diary]', root).forEach((b) => b.addEventListener('click', () => diary(root, DIARY_PROMPTS[+b.dataset.diary])));
  }

  const DIARY_PROMPTS = [
    { glyph: '日', title: 'Today’s diary', hint: 'What did you do today? 3–5 sentences.', prompt: 'Write a short diary entry about your day.' },
    { glyph: '私', title: 'About me', hint: 'Introduce yourself: name, country, job, hobbies.', prompt: 'Introduce yourself.' },
    { glyph: '家', title: 'My family', hint: 'Who is in your family? What are they like?', prompt: 'Describe your family.' },
    { glyph: '週', title: 'Last weekend', hint: 'Where did you go? What did you eat?', prompt: 'Write about what you did last weekend.' },
    { glyph: '町', title: 'My town', hint: 'What is there? Is it quiet or lively?', prompt: 'Describe the town where you live.' },
    { glyph: '夢', title: 'Things I want to do', hint: 'Use ～たい: where do you want to go in Japan?', prompt: 'Write about things you want to do, using ～たい.' },
  ];

  function diary(root, p) {
    window.scrollTo(0, 0);
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Free writing', title: p.title, desc: `${esc(p.hint)} Write in kana (romaji isn’t checked). Sensei will correct each sentence and explain why.`, actions: `<button class="btn ghost" data-quit>${S.icon('left')} Back</button>` })}
      <section class="card">
        <textarea class="writing-input diary" lang="ja" rows="6" placeholder="きょうは…" aria-label="Your writing" data-text>${esc(S.store.read('sakura_diary_draft', {})[p.title] || '')}</textarea>
        <div class="row gap wrap"><button class="btn primary" data-correct ${S.ai.hasChat() ? '' : 'disabled'}>${S.icon('spark')} Correct my writing</button>
          ${S.ai.hasChat() ? '' : '<a class="btn ghost" href="#/account?ai=1">Add a Claude key</a>'}</div>
      </section>
      <section class="card" data-out hidden></section>`;
    const ta = S.$('[data-text]', root);
    ta.addEventListener('input', S.debounce(() => { const d = S.store.read('sakura_diary_draft', {}); d[p.title] = ta.value; S.store.write('sakura_diary_draft', d, true); }, 400));
    S.$('[data-quit]', root).addEventListener('click', () => intro(root));
    S.$('[data-correct]', root).addEventListener('click', async (e) => {
      const text = ta.value.trim();
      if (text.length < 4) { S.toast('Write a little more first'); return; }
      const btn = e.currentTarget, out = S.$('[data-out]', root);
      btn.classList.add('loading'); btn.disabled = true;
      try {
        const r = await S.ai.correct({ prompt: p.prompt, text });
        out.hidden = false;
        out.innerHTML = `<div class="result-head">${S.ui.ring(r.score, { size: 76, stroke: 7, tone: S.ui.scoreTone(r.score) })}<div><h2>Sensei’s corrections</h2><p class="muted">${esc(r.overall)}</p></div></div>
          <ol class="fix-list">${r.sentences.map((x) => `<li class="${x.ok ? 'ok' : ''}">
            ${x.ok ? '' : `<div class="mistake-row bad">${S.icon('x')}<span lang="ja">${esc(x.original)}</span></div>`}
            <div class="mistake-row good">${S.icon('check')}<span lang="ja">${esc(x.corrected)}</span> ${S.ui.speak(x.corrected, { slow: false })}</div>
            <div class="small">${esc(x.english)}</div><div class="muted small">${esc(x.note)}</div></li>`).join('')}</ol>`;
        S.store.scores.add('Writing', Math.round((r.score / 100) * r.sentences.length), r.sentences.length || 1);
        S.store.activity.log(2);
        out.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } catch (err) { S.toast(err.message); }
      btn.classList.remove('loading'); btn.disabled = false;
    });
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
          <div class="row gap">${S.ai.hasChat() ? `<button class="btn sm primary" data-ai>${S.icon('spark')} Check with Sensei</button>` : ''}<button class="btn sm" data-check>${S.icon('eye')} ${S.ai.hasChat() ? 'Show model answer' : 'Check'}</button></div>
          <div class="ai-verdict" data-verdict hidden></div>
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
      const aiBtn = e.target.closest('[data-ai]');
      if (aiBtn && sec) aiCheck(sec, aiBtn);
      const r = e.target.closest('[data-rate]');
      if (r && sec) { ratings[sec.dataset.i] = +r.dataset.rate; S.$$('[data-rate]', sec).forEach((b) => b.classList.toggle('chosen', b === r)); }
      if (e.target.closest('[data-finish]')) finish();
    });
    S.$('[data-quit]', root).addEventListener('click', () => intro(root));

    async function aiCheck(sec, btn) {
      const it = items[+sec.dataset.i];
      const answer = S.$('.writing-input', sec).value.trim();
      if (!answer) { S.toast('Write your answer first'); return; }
      btn.classList.add('loading'); btn.disabled = true;
      try {
        const r = await S.ai.grade({ english: it.en, answer, model: it.jp });
        const v = S.$('[data-verdict]', sec);
        v.hidden = false;
        v.className = `ai-verdict ${r.verdict}`;
        v.innerHTML = `<b>${r.verdict === 'correct' ? `${S.icon('check')} Correct!` : r.verdict === 'almost' ? 'Almost!' : `${S.icon('x')} Not quite`}</b>
          ${r.verdict !== 'correct' ? `<div lang="ja">${esc(r.corrected)} ${S.ui.speak(r.corrected, { slow: false })}</div>` : ''}<div class="muted small">${esc(r.feedback)}</div>`;
        S.$('.model', sec).hidden = false; S.$('[data-check]', sec)?.remove();
        const rate = r.verdict === 'correct' ? 2 : r.verdict === 'almost' ? 1 : 0;
        ratings[sec.dataset.i] = rate;
        S.$$('[data-rate]', sec).forEach((b) => b.classList.toggle('chosen', +b.dataset.rate === rate));
        btn.remove();
      } catch (err) { S.toast(err.message); btn.classList.remove('loading'); btn.disabled = false; }
    }

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
