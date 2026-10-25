// Resources — hand-picked external sites for N5 learners.
(function (S) {
  const esc = S.esc;
  S.view('resources', {
    render(root) {
      root.innerHTML = `
        ${S.ui.pageHead({ kicker: 'Explore', title: 'Resources', jp: 'しりょう', desc: 'The best free and paid sites to go alongside Sakura Study.' })}
        <div class="resource-grid">${RESOURCES.map((r) => `
          <a class="card resource" href="${esc(r.url)}" target="_blank" rel="noopener">
            <span class="resource-icon" aria-hidden="true">${esc(r.icon)}</span>
            <span class="resource-body"><b>${esc(r.name)}</b><span class="muted small">${esc(r.desc)}</span>
              <span class="row gap">${S.ui.badge(r.tag, 'soft')}<span class="muted small">${esc(r.url.replace(/^https?:\/\//, ''))}</span></span></span>
            ${S.icon('external')}
          </a>`).join('')}</div>`;
    },
  });
})(window.S);
