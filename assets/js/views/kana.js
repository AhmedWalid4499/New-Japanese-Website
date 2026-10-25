// Kana — hiragana & katakana charts. Tap any character to hear it.
(function (S) {
  const esc = S.esc;
  const VOWELS = ['a', 'i', 'u', 'e', 'o'];

  const cell = (c) => c.k
    ? `<button class="kana-cell" data-speak="${esc(c.k)}" aria-label="${esc(c.k)} ${esc(c.r)}"><span class="kana-char" lang="ja">${esc(c.k)}</span><span class="kana-rom">${esc(c.r)}</span></button>`
    : '<span class="kana-cell empty" aria-hidden="true"></span>';

  const table = (rows) => `<div class="kana-table">
    <div class="kana-row head"><span></span>${VOWELS.map((v) => `<span>${v}</span>`).join('')}</div>
    ${rows.map((r) => `<div class="kana-row"><span class="kana-label" lang="ja">${esc(r.row)}</span>${r.cells.map(cell).join('')}</div>`).join('')}
  </div>`;

  S.view('kana', {
    render(root, { query }) {
      let script = query.s === 'katakana' ? 'katakana' : 'hiragana';
      let romaji = true;

      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Learn', title: 'Kana', jp: 'かな', desc: '<b>Hiragana</b> writes native words and grammar; <b>katakana</b> writes loanwords and emphasis. Master both before anything else — tap a character to hear it.', actions: `<button class="btn primary" data-go="quiz?type=kana">${S.icon('target')} Quiz yourself</button>` })}
        <div class="toolbar">
          ${S.ui.tabs('script', [{ value: 'hiragana', label: 'ひらがな Hiragana' }, { value: 'katakana', label: 'カタカナ Katakana' }], script)}
          <label class="switch"><input type="checkbox" data-romaji checked><span></span>Show romaji</label>
        </div>
        <div data-body></div>`;

      const body = S.$('[data-body]', root);
      const paint = () => {
        const rows = script === 'hiragana' ? HIRAGANA_ROWS : KATAKANA_ROWS;
        const basic = rows.slice(0, 11), voiced = rows.slice(11, 16), combos = rows.slice(16);
        body.classList.toggle('hide-romaji', !romaji);
        body.innerHTML = `
          <section class="card"><h2 class="card-title">Basic ${script} <span class="muted">46</span></h2>${table(basic)}</section>
          <section class="card"><h2 class="card-title">Voiced sounds <span class="muted">dakuten ゛ & handakuten ゜</span></h2>${table(voiced)}</section>
          ${combos.length ? `<section class="card"><h2 class="card-title">Combinations <span class="muted">yōon — small ゃ ゅ ょ</span></h2>
            <div class="kana-flow">${combos.flatMap((r) => r.cells).map(cell).join('')}</div></section>` : `
            <section class="card tip"><h2 class="card-title">Katakana combinations</h2><p>They work exactly like hiragana: キャ kya, シュ shu, チョ cho… Katakana also has extra combos for foreign sounds, like ファ fa, ティ ti and ウィ wi.</p></section>`}`;
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { script = chip.dataset.chip; S.ui.setChip(root, 'script', script); paint(); }
      });
      S.$('[data-romaji]', root).addEventListener('change', (e) => { romaji = e.target.checked; body.classList.toggle('hide-romaji', !romaji); });
      paint();
    },
  });
})(window.S);
