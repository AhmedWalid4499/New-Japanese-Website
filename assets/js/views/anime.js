// Anime corner — trending anime from the free Jikan (MyAnimeList) API, for immersion reading.
(function (S) {
  const esc = S.esc;
  const API = 'https://api.jikan.moe/v4/top/anime';
  const TABS = [
    { value: 'trending', label: 'Trending', url: `${API}?filter=bypopularity&limit=12` },
    { value: 'airing', label: 'Airing now', url: `${API}?filter=airing&limit=12` },
    { value: 'upcoming', label: 'Upcoming', url: `${API}?filter=upcoming&limit=12` },
    { value: 'top', label: 'Top rated', url: `${API}?limit=12` },
  ];
  const cache = {};

  // A short, simple Japanese summary built from the data — good N5/N4 reading practice
  const jpSummary = (a) => {
    const type = a.type === 'TV' ? 'テレビアニメ' : a.type === 'Movie' ? 'アニメえいが' : 'アニメ';
    const year = a.aired?.prop?.from?.year ? `${a.aired.prop.from.year}ねんの ` : '';
    const eps = a.episodes ? `ぜんぶで ${a.episodes}わ あります。` : '';
    const status = a.status === 'Currently Airing' ? 'いま ほうそうちゅうです。' : '';
    const score = a.score ? `スコアは ${a.score}てんです。` : '';
    return `「${a.title_japanese || a.title}」は ${year}${type}です。${eps}${status}${score}`;
  };

  const card = (a) => {
    const poster = a.images?.webp?.image_url || a.images?.jpg?.image_url || '';
    const syn = (a.synopsis || '').replace(/\[Written[^\]]*\]/g, '').trim();
    const summary = jpSummary(a);
    return `<article class="card anime-card">
      ${poster ? `<img src="${esc(poster)}" alt="" loading="lazy" class="anime-poster">` : '<div class="anime-poster"></div>'}
      <div class="anime-body">
        <div class="row gap">${a.score ? S.ui.badge(`★ ${a.score}`, 'warn') : ''}${a.episodes ? S.ui.badge(`${a.episodes} eps`, 'soft') : ''}</div>
        <h3 lang="ja">${esc(a.title_japanese || a.title)}</h3>
        <div class="muted small">${esc(a.title_english || a.title)}</div>
        <div class="row gap wrap">${(a.genres || []).slice(0, 3).map((g) => `<span class="tag">${esc(g.name)}</span>`).join('')}</div>
        <p class="anime-jp" lang="ja">${esc(summary)} ${S.ui.speak(summary, { slow: false })}</p>
        ${syn ? `<details><summary>English synopsis</summary><p class="small">${esc(syn.slice(0, 420))}${syn.length > 420 ? '…' : ''}</p></details>` : ''}
        <a class="link small" href="https://myanimelist.net/anime/${esc(a.mal_id)}" target="_blank" rel="noopener">MyAnimeList ${S.icon('external')}</a>
      </div>
    </article>`;
  };

  S.view('anime', {
    render(root) {
      let tab = 'trending';
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Explore', title: 'Anime corner', jp: 'アニメ', desc: 'Discover popular shows and practise reading with a simple Japanese summary of each one.' })}
        <div class="toolbar">${S.ui.tabs('tab', TABS, tab)}</div>
        <div class="anime-grid" data-grid></div>`;
      const grid = S.$('[data-grid]', root);

      const load = async () => {
        const t = TABS.find((x) => x.value === tab);
        if (cache[tab]) { grid.innerHTML = cache[tab]; return; }
        grid.innerHTML = '<div class="loading span-all"><span class="spinner"></span> Loading anime…</div>';
        try {
          const res = await fetch(t.url);
          const json = await res.json();
          if (!json.data?.length) throw new Error('empty');
          cache[tab] = json.data.map(card).join('');
          if (tab === t.value) grid.innerHTML = cache[tab];
        } catch (e) {
          grid.innerHTML = `<div class="span-all">${S.ui.empty('Couldn’t load anime right now', 'The anime service may be busy. Check your connection and try again.', `<button class="btn" data-retry>${S.icon('refresh')} Retry</button>`)}</div>`;
        }
      };
      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) { tab = chip.dataset.chip; S.ui.setChip(root, 'tab', tab); load(); }
        if (e.target.closest('[data-retry]')) load();
      });
      load();
    },
  });
})(window.S);
