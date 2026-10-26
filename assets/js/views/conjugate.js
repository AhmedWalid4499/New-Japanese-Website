// Conjugation trainer — drill verb and adjective forms until they are automatic.
(function (S) {
  const esc = S.esc;
  const C = window.Conj;
  const DEFAULT = { kind: 'verb', forms: ['verb:masu', 'verb:masen', 'verb:te', 'verb:nai', 'verb:ta', 'adj:neg', 'adj:past', 'adj:pastneg'], mode: 'type', count: 10 };
  const cfg = () => ({ ...DEFAULT, ...(S.store.settings.get('conj') || {}) });
  const setCfg = (patch) => S.store.settings.set('conj', { ...cfg(), ...patch });

  const formsFor = (kind) => (kind === 'adj' ? C.ADJ_FORMS : C.VERB_FORMS);
  const formKey = (kind, f) => `${kind}:${f}`;

  function makeQuestions(c) {
    const pool = [];
    const kinds = c.kind === 'both' ? ['verb', 'adj'] : [c.kind];
    kinds.forEach((k) => {
      const words = k === 'adj' ? C.ADJS : C.VERBS;
      const forms = c.forms.filter((f) => f.startsWith(`${k}:`)).map((f) => f.split(':')[1]);
      (forms.length ? forms : Object.keys(formsFor(k)).slice(0, 4)).forEach((f) => words.forEach((w) => pool.push({ w, f, kind: k })));
    });
    return S.sample(pool, c.count).map((q) => ({ ...q, answer: C.conjugate(q.w, q.f) }));
  }

  // Plausible wrong answers: wrong group rules + other forms of the same word
  function distractors(q) {
    const out = new Set();
    const alt = q.kind === 'adj' ? [{ ...q.w, group: q.w.group === 'i' ? 'na' : 'i' }] : ['u', 'ru'].filter((g) => g !== q.w.group).map((g) => ({ ...q.w, group: g }));
    alt.forEach((w) => { try { out.add(C.conjugate(w, q.f)); } catch (e) {} });
    if (q.kind === 'verb' && q.w.group === 'u' && (q.f === 'te' || q.f === 'ta')) {
      const s = q.w.dict.slice(0, -1);
      ['って', 'んで', 'いて', 'して'].map((e) => s + (q.f === 'ta' ? e.replace('て', 'た').replace('で', 'だ') : e)).forEach((x) => out.add(x));
    }
    Object.keys(formsFor(q.kind)).filter((f) => f !== q.f).forEach((f) => out.add(C.conjugate(q.w, f)));
    out.delete(q.answer);
    return S.shuffle([...out]).slice(0, 3);
  }

  function setup(root) {
    const c = cfg();
    const formChecks = (kind) => Object.entries(formsFor(kind)).map(([f, d]) =>
      `<label class="check-pill"><input type="checkbox" value="${formKey(kind, f)}" ${c.forms.includes(formKey(kind, f)) ? 'checked' : ''}><span><b lang="ja">${esc(d.jp)}</b> ${esc(d.label)}</span></label>`).join('');
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Conjugation trainer', jp: 'かつよう', desc: 'Drill verb and adjective forms until they come out automatically. Type the answer (romaji is fine — it turns into kana) or pick from four options. Every answer comes with the rule.' })}
      <section class="card conj-setup">
        <div class="field-label">Words</div>
        ${S.ui.chips('kind', [{ value: 'verb', label: `Verbs (${C.VERBS.length})` }, { value: 'adj', label: `Adjectives (${C.ADJS.length})` }, { value: 'both', label: 'Both' }], c.kind)}
        <div data-forms-verb ${c.kind === 'adj' ? 'hidden' : ''}><div class="field-label">Verb forms</div><div class="check-grid">${formChecks('verb')}</div></div>
        <div data-forms-adj ${c.kind === 'verb' ? 'hidden' : ''}><div class="field-label">Adjective forms</div><div class="check-grid">${formChecks('adj')}</div></div>
        <div class="row gap wrap">
          <div><div class="field-label">Answer by</div>${S.ui.chips('mode', [{ value: 'type', label: 'Typing' }, { value: 'choice', label: 'Multiple choice' }], c.mode)}</div>
          <div><div class="field-label">Questions</div>${S.ui.chips('count', [10, 20, 30].map((n) => ({ value: String(n), label: String(n) })), String(c.count))}</div>
        </div>
        <button class="btn primary lg" data-start>${S.icon('play')} Start drill</button>
      </section>
      <section class="card tip">
        <h3>Quick rules</h3>
        <ul class="checklist">
          <li><b>Group 2</b> (most verbs ending in -iru / -eru): drop る, add the ending — たべる → たべます, たべて, たべない.</li>
          <li><b>Group 1</b>: change the last sound — かく → かきます, かかない, かいて. The て-form follows the song: う・つ・る → って, む・ぶ・ぬ → んで, く → いて, ぐ → いで, す → して. Exception: いく → いって.</li>
          <li><b>Group 3</b>: する → します, しない, して; くる → きます, こない, きて.</li>
          <li><b>い-adjectives</b>: drop い → くない, かった, くて (いい → よくない). <b>な-adjectives</b>: じゃない, でした, で.</li>
        </ul>
        <a class="btn ghost sm" href="#/course/te-form">${S.icon('book')} Read the て-form lesson</a>
      </section>`;

    root.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-chip]');
      if (chip) {
        const g = chip.closest('[data-chips]').dataset.chips;
        S.ui.setChip(root, g, chip.dataset.chip);
        if (g === 'kind') {
          S.$('[data-forms-verb]', root).hidden = chip.dataset.chip === 'adj';
          S.$('[data-forms-adj]', root).hidden = chip.dataset.chip === 'verb';
        }
        return;
      }
      if (e.target.closest('[data-start]')) {
        const val = (g) => S.$(`[data-chips="${g}"] .chip.on`, root).dataset.chip;
        const forms = S.$$('.check-pill input:checked', root).map((i) => i.value);
        const kind = val('kind');
        const relevant = forms.filter((f) => kind === 'both' || f.startsWith(`${kind}:`));
        if (!relevant.length) { S.toast('Pick at least one form to practise'); return; }
        setCfg({ kind, forms, mode: val('mode'), count: +val('count') });
        drill(root, cfg());
      }
    });
  }

  function drill(root, c) {
    const qs = makeQuestions(c);
    let i = 0, score = 0;
    const misses = [];
    window.scrollTo(0, 0);

    const show = () => {
      const q = qs[i];
      const fd = formsFor(q.kind)[q.f];
      const opts = c.mode === 'choice' ? S.shuffle([q.answer, ...distractors(q)]) : null;
      root.innerHTML = `
        <div class="quiz conj">
          <div class="quiz-top"><button class="btn ghost sm" data-quit>${S.icon('left')} Stop</button><span class="spacer"></span><span class="quiz-count">${i + 1} / ${qs.length}</span><span class="badge good">${score} correct</span></div>
          ${S.ui.bar(S.pct(i, qs.length))}
          <section class="card conj-card">
            <div class="conj-word"><span lang="ja">${esc(q.w.dict)}</span> ${S.ui.speak(q.w.dict, { slow: false })}</div>
            <div class="muted">${esc(q.w.en)} · ${S.ui.badge(C.GROUP_NAME[q.w.group], 'soft')}</div>
            <div class="conj-arrow">${S.icon('down')}</div>
            <div class="conj-target"><b>${esc(fd.label)}</b> <span class="muted" lang="ja">${esc(fd.jp)}</span></div>
            ${opts ? `<div class="options">${opts.map((o, k) => `<button class="option" data-o="${esc(o)}"><span class="opt-letter">${k + 1}</span><span lang="ja">${esc(o)}</span></button>`).join('')}</div>`
              : `<form class="conj-form" data-form><input class="conj-input" lang="ja" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type in kana or romaji…" aria-label="Your answer"><div class="conj-preview muted small" data-preview></div>
                <button class="btn primary" type="submit">Check</button></form>`}
            <div data-fb></div>
          </section>
        </div>`;
      const input = S.$('.conj-input', root);
      if (input) {
        input.focus();
        input.addEventListener('input', () => { const v = input.value; S.$('[data-preview]', root).textContent = /[a-z]/i.test(v) ? `→ ${C.toKana(v)}` : ''; });
        S.$('[data-form]', root).addEventListener('submit', (e) => { e.preventDefault(); if (input.value.trim()) answer(input.value); });
      }
      S.$$('[data-o]', root).forEach((b) => b.addEventListener('click', () => answer(b.dataset.o, b)));
      S.$('[data-quit]', root).addEventListener('click', () => setup(root));
    };

    const answer = (given, btn) => {
      const q = qs[i];
      const ok = C.normalize(given) === C.normalize(q.answer);
      if (ok) score++; else misses.push({ ...q, given });
      S.$$('[data-o], .conj-form button, .conj-input', root).forEach((x) => { x.disabled = true; });
      if (btn) { btn.classList.add(ok ? 'correct' : 'wrong'); S.$$('[data-o]', root).find((b) => b.dataset.o === q.answer)?.classList.add('correct'); }
      S.tts.speak(q.answer);
      S.$('[data-fb]', root).innerHTML = `<div class="feedback ${ok ? 'good' : 'bad'}">${ok ? `${S.icon('check')} <b>Correct!</b>` : `${S.icon('x')} <b>Answer:</b> <span lang="ja">${esc(q.answer)}</span>`}</div>
        <p class="muted small conj-rule">${esc(C.rule(q.w, q.f))}</p>
        <button class="btn primary block" data-next>${i + 1 < qs.length ? 'Next' : 'See results'} ${S.icon('right')}</button>`;
      const nb = S.$('[data-next]', root);
      nb.focus();
      nb.addEventListener('click', () => { i++; if (i < qs.length) show(); else finish(); });
    };

    const finish = () => {
      const pct = S.pct(score, qs.length);
      S.store.scores.add('Conjugation', score, qs.length);
      S.store.activity.log(qs.length);
      if (pct >= 80) S.confetti();
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Conjugation trainer', title: 'Drill complete' })}
        <section class="card result">
          <div class="result-head">${S.ui.ring(pct, { size: 88, stroke: 8, tone: S.ui.scoreTone(pct) })}
            <div><h2>${score} of ${qs.length} correct</h2><p class="lead">${pct === 100 ? 'Flawless — 完璧！' : pct >= 80 ? 'Excellent — these forms are sticking.' : 'Keep drilling — repetition makes it automatic.'}</p></div></div>
          ${misses.length ? `<h3>Review these</h3><ul class="miss-list">${misses.map((m) => `<li><span lang="ja">${esc(m.w.dict)}</span> → <b>${esc(formsFor(m.kind)[m.f].label)}</b>: <span lang="ja" class="good-text">${esc(m.answer)}</span> <span class="muted small">(you: <span lang="ja">${esc(C.toKana(m.given))}</span>)</span><div class="muted small">${esc(C.rule(m.w, m.f))}</div></li>`).join('')}</ul>` : ''}
          <div class="row gap wrap"><button class="btn primary" data-again>${S.icon('refresh')} Same settings again</button><button class="btn" data-setup>Change settings</button></div>
        </section>`;
      S.$('[data-again]', root).addEventListener('click', () => drill(root, c));
      S.$('[data-setup]', root).addEventListener('click', () => setup(root));
    };

    show();
  }

  S.view('conjugate', { render(root) { setup(root); } });
})(window.S);
