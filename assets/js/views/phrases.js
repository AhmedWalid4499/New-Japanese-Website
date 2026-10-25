// Survival phrases — real situations, with audio, tips and "know it" tracking.
(function (S) {
  const esc = S.esc;
  const CATS = {
    greetings: 'Greetings', shopping: 'Shopping', directions: 'Directions', restaurant: 'Restaurant',
    transport: 'Transport', hotel: 'Hotel', emergency: 'Emergency',
  };
  // Stable ids (same scheme as before, so saved "know it" marks still apply)
  S.phraseId = (p) => `phr_${p.cat}_${SURVIVAL_PHRASES.filter((x) => x.cat === p.cat).indexOf(p)}`;

  S.view('phrases', {
    render(root, { params }) {
      let cat = 'all';
      const target = params[0] != null ? SURVIVAL_PHRASES[+params[0]] : null;
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Learn', title: 'Survival phrases', jp: 'かいわ', desc: 'Phrases you could use in Japan tomorrow, organised by situation. Blanks (___) are where you add your own word.' })}
        <div class="toolbar sticky">${S.ui.chips('cat', [{ value: 'all', label: 'All', count: SURVIVAL_PHRASES.length }, ...Object.entries(CATS).map(([value, label]) => ({ value, label, count: SURVIVAL_PHRASES.filter((p) => p.cat === value).length }))], cat)}</div>
        <div data-list></div>`;
      const list = S.$('[data-list]', root);

      const paint = () => {
        list.innerHTML = Object.entries(CATS).filter(([c]) => cat === 'all' || c === cat).map(([c, label]) => `
          <section class="section-block"><h2 class="section-title">${esc(label)}</h2>
            <div class="phrase-grid">${SURVIVAL_PHRASES.filter((p) => p.cat === c).map((p) => {
              const id = S.phraseId(p);
              return `<article class="card phrase" id="${id}">
                <div class="phrase-jp" lang="ja">${esc(p.jp)}</div>
                <div class="phrase-rom">${esc(p.rom)}</div>
                <div class="phrase-en">${esc(p.en)}</div>
                ${p.tip ? `<div class="phrase-tip">${esc(p.tip)}</div>` : ''}
                <footer class="card-foot">${S.ui.speak(p.jp)}<span class="spacer"></span>${S.ui.know('phrases', id)}${S.ui.bm(id, { type: 'phrase', label: p.jp, detail: p.en })}</footer>
              </article>`;
            }).join('')}</div></section>`).join('');
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { cat = chip.dataset.chip; S.ui.setChip(root, 'cat', cat); paint(); }
      });
      paint();
      if (target) { const el = document.getElementById(S.phraseId(target)); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); } }
    },
  });
})(window.S);
