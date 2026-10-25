// Dictionary — powered by the free Jotoba API (words + kanji). Results can be saved to "My words".
(function (S) {
  const esc = S.esc;
  const API = 'https://jotoba.de/api/search';
  const QUICK = [['猫', 'cat'], ['食べる', 'eat'], ['美しい', 'beautiful'], ['電車', 'train'], ['友達', 'friend']];
  const POS = { Noun: 'Noun', Verb: 'Verb', Adjective: 'Adj', Adverb: 'Adv', Particle: 'Particle', Expression: 'Expr', Interjection: 'Interj', Pronoun: 'Pronoun', Ichidan: 'Ichidan verb', Godan: 'Godan verb', NaAdjective: 'な-adj', IAdjective: 'い-adj', Suru: 'する verb' };
  const posLabel = (p) => {
    if (typeof p === 'string') return POS[p] || p;
    if (p && typeof p === 'object') { const k = Object.keys(p)[0]; return POS[k] || k; }
    return '';
  };

  const post = (kind, query) => fetch(`${API}/${kind}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, language: 'English', no_english: false }),
  }).then((r) => (r.ok ? r.json() : null));

  const wordHtml = (w, i) => {
    const word = w.reading?.kanji || w.reading?.kana || '';
    const kana = w.reading?.kana || '';
    const senses = (w.senses || []).slice(0, 4);
    const pos = S.uniq((senses[0]?.pos || senses[0]?.part_of_speech || []).map(posLabel).filter(Boolean));
    return `<article class="card dict-entry">
      <header class="row gap wrap">
        <div><div class="dict-word" lang="ja">${esc(word)}</div>${kana && kana !== word ? `<div class="muted" lang="ja">${esc(kana)}</div>` : ''}</div>
        <span class="spacer"></span>
        ${w.jlpt_lvl ? S.ui.badge(`N${w.jlpt_lvl}`, 'primary') : ''}${w.common ? S.ui.badge('Common', 'good') : ''}
      </header>
      ${pos.length ? `<div class="row gap">${pos.map((p) => S.ui.badge(p, 'soft')).join('')}</div>` : ''}
      <ol class="senses">${senses.map((s) => `<li>${esc((s.glosses || []).slice(0, 4).join('; '))}</li>`).join('')}</ol>
      <footer class="row gap">
        ${w.audio ? `<button class="btn sm" data-audio="https://jotoba.de${esc(w.audio)}">${S.icon('volume')} Native audio</button>` : ''}
        ${S.ui.speak(kana || word, { slow: false, label: w.audio ? '' : 'Listen' })}
        <button class="btn sm ghost" data-save="${i}">${S.icon('plus')} Save to my words</button>
      </footer>
    </article>`;
  };

  const kanjiHtml = (k) => `<article class="card dict-entry kanji-result">
    <button class="dict-kanji" lang="ja" data-speak="${esc(k.literal)}">${esc(k.literal)}</button>
    <div>
      <div class="row gap wrap">${k.jlpt ? S.ui.badge(`N${k.jlpt}`, 'primary') : ''}${k.stroke_count ? S.ui.badge(`${k.stroke_count} strokes`, 'soft') : ''}${k.grade ? S.ui.badge(`Grade ${k.grade}`, 'soft') : ''}</div>
      <p class="strong">${esc((k.meanings || []).slice(0, 4).join(', '))}</p>
      ${(k.kunyomi || []).length ? `<div class="small"><span class="muted">Kun</span> <span lang="ja">${esc(k.kunyomi.slice(0, 4).join('、'))}</span></div>` : ''}
      ${(k.onyomi || []).length ? `<div class="small"><span class="muted">On</span> <span lang="ja">${esc(k.onyomi.slice(0, 4).join('、'))}</span></div>` : ''}
    </div>
  </article>`;

  S.view('dictionary', {
    render(root, { query }) {
      let words = [];
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Explore', title: 'Dictionary', jp: 'じしょ', desc: 'Search in Japanese (kanji or kana), romaji, or English. Powered by <a href="https://jotoba.de" target="_blank" rel="noopener">Jotoba</a>.' })}
        <form class="dict-form card" role="search">
          ${S.ui.searchBox('e.g. 食べる, たべる, eat, 水', query.q || '')}
          <button class="btn primary" type="submit">Search</button>
        </form>
        <div class="row gap wrap quick"><span class="muted small">Try:</span>${QUICK.map(([w, en]) => `<button class="chip" data-q="${esc(w)}"><span lang="ja">${esc(w)}</span> ${esc(en)}</button>`).join('')}</div>
        <div data-history></div>
        <div class="stack" data-results></div>`;
      const input = S.$('input', root);
      const results = S.$('[data-results]', root);

      const paintHistory = () => {
        const h = S.store.dict.list();
        S.$('[data-history]', root).innerHTML = h.length ? `<div class="row gap wrap quick"><span class="muted small">Recent:</span>${h.map((w) => `<button class="chip" data-q="${esc(w)}" lang="ja">${esc(w)}</button>`).join('')}<button class="btn ghost sm" data-clear-history>Clear</button></div>` : '';
      };

      async function search(q) {
        q = q.trim();
        if (!q) return;
        input.value = q;
        S.store.dict.push(q);
        paintHistory();
        results.innerHTML = '<div class="loading"><span class="spinner"></span> Looking up…</div>';
        try {
          const [w, k] = await Promise.all([post('words', q), post('kanji', q).catch(() => null)]);
          words = w?.words || [];
          const kanji = k?.kanji || [];
          if (!words.length && !kanji.length) { results.innerHTML = S.ui.empty(`No results for “${esc(q)}”`, 'Try a different spelling, the dictionary form of a verb, or an English word.'); return; }
          results.innerHTML = `${kanji.length ? `<h2 class="section-title">Kanji</h2>${kanji.slice(0, 4).map(kanjiHtml).join('')}` : ''}
            ${words.length ? `<h2 class="section-title">Words</h2>${words.slice(0, 10).map(wordHtml).join('')}` : ''}`;
        } catch (e) {
          results.innerHTML = S.ui.empty('Couldn’t reach the dictionary', 'Check your internet connection and try again. You can also look words up on <a href="https://jisho.org" target="_blank" rel="noopener">jisho.org</a>.');
        }
      }

      S.$('form', root).addEventListener('submit', (e) => { e.preventDefault(); search(input.value); });
      root.addEventListener('click', (e) => {
        const q = e.target.closest('[data-q]');
        if (q) { search(q.dataset.q); return; }
        if (e.target.closest('[data-clear-history]')) { S.store.dict.clear(); paintHistory(); return; }
        const a = e.target.closest('[data-audio]');
        if (a) { new Audio(a.dataset.audio).play().catch(() => S.toast('Audio unavailable')); return; }
        const s = e.target.closest('[data-save]');
        if (s) {
          const w = words[+s.dataset.save];
          if (!w) return;
          const jp = w.reading?.kanji || w.reading?.kana;
          if (S.store.custom.list('vocab').some((v) => v.jp === jp)) { S.toast('Already in your words'); return; }
          S.store.custom.add('vocab', { jp, read: w.reading?.kana || '', en: (w.senses?.[0]?.glosses || []).slice(0, 2).join('; '), cat: 'custom' });
          s.disabled = true; s.innerHTML = `${S.icon('check')} Saved`;
          S.toast('Saved to Vocabulary → Mine');
        }
      });
      paintHistory();
      if (query.q) search(query.q); else input.focus();
    },
  });
})(window.S);
