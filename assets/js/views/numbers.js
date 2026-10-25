// Numbers & time — numbers, telling time, dates and money. Tap any card to hear it.
(function (S) {
  const esc = S.esc;
  const TABS = [{ value: 'basics', label: 'Numbers' }, { value: 'time', label: 'Time' }, { value: 'dates', label: 'Dates' }, { value: 'money', label: 'Money' }];

  const cards = (arr) => `<div class="num-grid">${arr.map((n) => `
    <button class="num-card" data-speak="${esc(n.jp.split('／')[0].trim())}">
      <span class="num-big">${esc(n.n || n.label)}</span><span class="num-jp" lang="ja">${esc(n.jp)}</span><span class="num-rom">${esc(n.rom)}</span>
    </button>`).join('')}</div>`;

  const table = (head, rows, jpCol = 0) => `<div class="table-wrap"><table class="table">
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td ${i === jpCol ? 'lang="ja"' : ''}>${i === jpCol ? `<button class="link-speak" data-speak="${esc(c)}">${esc(c)}</button>` : esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  const CONTENT = {
    basics: () => `${cards(NUM_BASICS)}<section class="card"><h2 class="card-title">Sound changes to remember</h2>${table(['Number', 'Japanese', 'Why'], NUM_SOUND_CHANGES, 1)}</section>`,
    time: () => `${cards(NUM_TIME)}<section class="card"><h2 class="card-title">Time in sentences</h2>${table(['Japanese', 'Meaning'], NUM_TIME_EXAMPLES)}
      <div class="callout">Watch the irregulars: 4時 is <b lang="ja">よじ</b>, 7時 is <b lang="ja">しちじ</b>, 9時 is <b lang="ja">くじ</b>.</div></section>`,
    dates: () => `${cards(NUM_DATES)}<section class="card"><h2 class="card-title">Irregular days — memorise these</h2>${table(['Day', 'Japanese', 'Reading'], NUM_IRREGULAR_DAYS, 1)}</section>`,
    money: () => `${cards(NUM_MONEY)}<section class="card"><h2 class="card-title">Shopping phrases</h2>${table(['Japanese', 'Meaning'], NUM_SHOPPING)}</section>`,
  };

  S.view('numbers', {
    render(root, { query }) {
      let tab = CONTENT[query.tab] ? query.tab : 'basics';
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Learn', title: 'Numbers & time', jp: 'すうじ', desc: 'Prices, times, dates and phone numbers appear all over the N5 exam. Tap any card to hear it.', actions: `<button class="btn primary" data-go="quiz?type=numbers">${S.icon('target')} Numbers quiz</button>` })}
        <div class="toolbar">${S.ui.tabs('tab', TABS, tab)}</div>
        <div class="stack" data-body></div>`;
      const body = S.$('[data-body]', root);
      const paint = () => { body.innerHTML = CONTENT[tab](); };
      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { tab = chip.dataset.chip; S.ui.setChip(root, 'tab', tab); paint(); }
      });
      paint();
    },
  });
})(window.S);
