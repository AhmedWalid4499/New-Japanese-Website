// Listening — hear a sentence first, try to understand it, then reveal the text.
(function (S) {
  const esc = S.esc;
  const SPEEDS = [['0.6', 'Slow'], ['0.85', 'Natural'], ['1', 'Normal'], ['1.25', 'Fast']];

  S.view('listening', {
    render(root) {
      let cat = 'all', listenFirst = true;
      const revealed = new Set();
      const rate = String(S.store.settings.get('ttsRate'));
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Practice', title: 'Listening', jp: 'ききとり', desc: 'Press play, try to understand, then reveal. Repeating out loud after each sentence (shadowing) builds speaking too.' })}
        ${S.tts.supported ? '' : '<div class="callout warn">Your browser has no speech engine. Try Chrome, Edge or Safari for listening practice.</div>'}
        <div class="toolbar">
          ${S.ui.chips('speed', SPEEDS.map(([value, label]) => ({ value, label: `${label} ${value}×` })), SPEEDS.some(([v]) => v === rate) ? rate : '0.85')}
          <label class="switch"><input type="checkbox" data-first checked><span></span>Listen first (hide text)</label>
        </div>
        <div class="toolbar">${S.ui.chips('cat', [{ value: 'all', label: 'All' }, ...LISTEN_CATEGORIES.map((c, i) => ({ value: String(i), label: c.title.replace(/^\S+\s/, ''), count: c.items.length }))], cat)}</div>
        <div data-list></div>`;
      const list = S.$('[data-list]', root);

      const paint = () => {
        list.innerHTML = LISTEN_CATEGORIES.map((c, ci) => ({ c, ci })).filter(({ ci }) => cat === 'all' || String(ci) === cat).map(({ c, ci }) => `
          <section class="section-block"><h2 class="section-title">${esc(c.title.replace(/^\S+\s/, ''))}</h2>
          <div class="listen-grid">${c.items.map((it, ii) => {
            const id = `lc${ci}_${ii}`;
            const hidden = listenFirst && !revealed.has(id);
            return `<article class="card listen ${hidden ? 'is-hidden' : ''}" id="${id}">
              <div class="listen-controls">
                <button class="play-btn" data-speak="${esc(it.jp)}" aria-label="Play">${S.icon('play')}</button>
                <button class="btn-icon slow" data-speak="${esc(it.jp)}" data-rate="0.5" title="Very slow">½×</button>
                <span class="spacer"></span>
                <button class="btn ghost sm" data-reveal="${id}">${S.icon('eye')} ${hidden ? 'Reveal' : 'Hide'}</button>
              </div>
              <div class="listen-text">
                <div class="listen-jp" lang="ja">${esc(it.jp)}</div>
                <div class="muted small">${esc(it.rom)}</div>
                <div>${esc(it.en)}</div>
              </div>
              <footer class="card-foot">${S.ui.know('listen', id)}</footer>
            </article>`;
          }).join('')}</div></section>`).join('');
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) {
          const group = chip.closest('[data-chips]').dataset.chips;
          if (group === 'speed') { S.store.settings.set('ttsRate', parseFloat(chip.dataset.chip)); S.ui.setChip(root, 'speed', chip.dataset.chip); }
          else { cat = chip.dataset.chip; S.ui.setChip(root, 'cat', cat); paint(); }
          return;
        }
        const r = e.target.closest('[data-reveal]');
        if (r) {
          const id = r.dataset.reveal;
          const card = document.getElementById(id);
          const hiddenNow = card.classList.toggle('is-hidden');
          if (hiddenNow) revealed.delete(id); else revealed.add(id);
          r.innerHTML = `${S.icon('eye')} ${hiddenNow ? 'Reveal' : 'Hide'}`;
        }
      });
      S.$('[data-first]', root).addEventListener('change', (e) => { listenFirst = e.target.checked; paint(); });
      paint();
    },
  });
})(window.S);
