// Counters (助数詞) — expandable list with number tables; irregular readings are highlighted.
(function (S) {
  const esc = S.esc;
  const CATS = [['all', 'All'], ['general', 'General'], ['objects', 'Objects'], ['people', 'People'], ['nature', 'Animals & nature'], ['time', 'Time'], ['places', 'Places']];

  function counterHtml(c, key, open) {
    const header = c.id === 'hon_long';
    const rows = header ? c.rows.slice(1) : c.rows || [];
    const irregular = rows.filter((r) => r.irreg).length;
    return `<details class="card counter" id="ctr-${key}" ${open ? 'open' : ''}>
      <summary>
        <span class="counter-emoji" aria-hidden="true">${esc(c.emoji || '•')}</span>
        <span class="counter-title"><b>${esc(c.title)}</b><span class="counter-suffix" lang="ja">${esc(c.suffix)}</span></span>
        ${irregular ? S.ui.badge(`${irregular} irregular`, 'warn') : ''}
        ${c._custom ? S.ui.badge('mine', 'soft') : ''}
        <span class="chev">${S.icon('down')}</span>
      </summary>
      <div class="counter-body">
        ${c.desc ? `<p class="explain">${esc(c.desc)}</p>` : ''}
        ${(c.pics || []).length ? `<div class="pics" aria-hidden="true">${c.pics.slice(0, 10).map(esc).join(' ')}</div>` : ''}
        <div class="table-wrap"><table class="table">
          <thead><tr>${header ? [c.rows[0].n, c.rows[0].jp, c.rows[0].rom, 'Example'].map((h) => `<th>${esc(h)}</th>`).join('') : '<th>#</th><th>Japanese</th><th>Romaji</th><th>Meaning</th>'}</tr></thead>
          <tbody>${rows.map((r) => `<tr class="${r.irreg ? 'irregular' : ''}">
            <td class="strong" ${header ? 'lang="ja"' : ''}>${esc(r.n)}</td>
            <td lang="ja">${header ? esc(r.jp) : `<button class="link-speak" data-speak="${esc(r.jp)}">${esc(r.jp)}</button>`}${r.irreg ? ' ' + S.ui.badge('irregular', 'warn') : ''}</td>
            <td class="muted">${esc(r.rom)}</td><td ${header ? 'lang="ja"' : ''}>${esc(r.en || '')}</td></tr>`).join('')}</tbody>
        </table></div>
        ${(c.examples || []).length ? `<h4 class="mini-title">Examples</h4><ul class="examples">${c.examples.map((ex) => `<li class="example"><div class="example-jp" lang="ja">${esc(ex.jp)} ${S.ui.speak(ex.jp)}</div><div class="example-rom">${esc(ex.rom)}</div><div class="example-en">${esc(ex.en)}</div></li>`).join('')}</ul>` : ''}
        ${c.note ? `<div class="callout">${esc(c.note)}</div>` : ''}
        ${c._custom ? `<button class="btn ghost sm" data-del="${c._ci}">${S.icon('trash')} Delete</button>` : ''}
      </div>
    </details>`;
  }

  S.view('counters', {
    render(root, { params }) {
      let cat = 'all';
      const target = params[0];
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Learn', title: 'Counters', jp: 'じょすうし', desc: 'In Japanese you can’t say “three books” with the number alone — you attach a counter that depends on <i>what</i> you count. Many change sound at 1, 3, 6, 8 and 10; those are marked <b>irregular</b>.', actions: `<button class="btn" data-add>${S.icon('plus')} Add counter</button>` })}
        <div class="toolbar">${S.ui.chips('cat', CATS.map(([value, label]) => ({ value, label })), cat)}
          <button class="btn ghost sm" data-expand>Expand all</button></div>
        <div class="stack" data-list></div>`;

      const list = S.$('[data-list]', root);
      const paint = () => {
        const custom = S.store.custom.list('counters').map((c, i) => ({ ...c, _custom: true, _ci: i }));
        const items = [...COUNTERS.map((c, i) => ({ c, key: i })), ...custom.map((c) => ({ c, key: `c${c._ci}` }))].filter(({ c }) => cat === 'all' || c.cat === cat);
        list.innerHTML = items.map(({ c, key }) => counterHtml(c, key, String(key) === target)).join('') || S.ui.empty('No counters here yet');
      };

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { cat = chip.dataset.chip; S.ui.setChip(root, 'cat', cat); paint(); return; }
        if (e.target.closest('[data-add]')) { S.custom.openForm('counters', paint); return; }
        const ex = e.target.closest('[data-expand]');
        if (ex) {
          const open = ex.textContent.includes('Expand');
          S.$$('details.counter', root).forEach((d) => { d.open = open; });
          ex.textContent = open ? 'Collapse all' : 'Expand all';
          return;
        }
        const del = e.target.closest('[data-del]');
        if (del) S.custom.remove('counters', +del.dataset.del, paint);
      });
      paint();
      if (target) { const el = document.getElementById(`ctr-${target}`); if (el) { el.scrollIntoView({ block: 'start' }); el.classList.add('flash'); } }
    },
  });
})(window.S);
