// App shell: tab bar + screen switching, service worker, first-run onboarding.
(function (A) {
  // Kanji tabs: 道 the path, 字 letters, 練 practice, 私 me
  const TABS = [
    { id: 'learn', label: 'Path', glyph: '道' },
    { id: 'letters', label: 'Letters', glyph: '字' },
    { id: 'practice', label: 'Practice', glyph: '練' },
    { id: 'profile', label: 'Me', glyph: '私' },
  ];

  A.go = (tab) => {
    A.tab = TABS.some((t) => t.id === tab) ? tab : 'learn';
    if (location.hash !== `#${A.tab}`) history.replaceState(null, '', `#${A.tab}`);
    const screen = A.$('#screen');
    const fresh = document.createElement('div');
    fresh.className = `screen screen-${A.tab}`;
    screen.replaceChildren(fresh);
    A.screens[A.tab](fresh);
    A.$$('#tabbar [data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === A.tab));
    if (A.tab !== 'learn') screen.scrollTop = 0;
  };

  function boot() {
    A.$('#tabbar').innerHTML = TABS.map((t) => `<button data-tab="${t.id}" aria-label="${t.label}">${t.icon ? A.icon(t.icon) : `<span class="tab-glyph" lang="ja">${t.glyph}</span>`}<span>${t.label}</span></button>`).join('');
    A.$('#tabbar').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { A.sfx('tap'); A.go(b.dataset.tab); } });
    document.addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) A.go(g.dataset.go); });
    A.go((location.hash || '#learn').slice(1));
    if (!A.state.profile.onboarded) A.onboarding(() => { A.go('learn'); A.startLesson(A.allLessons[0]); });
    // Refresh hearts/streak when the app comes back to the foreground
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !document.body.classList.contains('in-lesson')) A.go(A.tab); });
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.A);
