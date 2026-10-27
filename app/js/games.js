// Mini-games: Kana Rain (falling kana), Memory (flip & match) and Time Attack (60-second vocab blitz).
(function (A) {
  const esc = A.esc;
  A.state.games = A.state.games || {};
  const best = (id) => A.state.games[id]?.best;

  // Shared end-of-game card: score, best, XP
  function gameOver(p, { id, score, label, unit = '', lowerIsBetter = false, xp, again }) {
    const prev = best(id);
    const isBest = prev == null || (lowerIsBetter ? score < prev : score > prev);
    if (isBest && (score > 0 || lowerIsBetter)) A.state.games[id] = { best: score };
    const xpFrom = A.state.xp;
    if (xp > 0) A.addXp(xp);
    A.pending = { ...(A.pending || {}), xp, xpFrom };
    A.quest('game', 1);
    A.save();
    A.sfx(isBest ? 'bell' : 'complete');
    if (isBest) A.confetti();
    p.body.innerHTML = `<div class="game-over center">
      <div class="maru-host">${A.mascot(score ? 'cheer big' : 'sad')}</div>
      <h1 lang="ja">${isBest ? 'しんきろく！' : 'おつかれさま！'}</h1>
      <p class="muted">${isBest ? 'New personal best!' : 'Nice try!'}</p>
      <dl class="tally"><div><dt>${esc(label)}</dt><dd>${score}${unit}</dd></div><div><dt>Best</dt><dd>${A.state.games[id]?.best ?? score}${unit}</dd></div><div><dt>${A.icon('bolt')} XP</dt><dd>+${xp}</dd></div></dl>
      <button class="btn primary block lg" data-again>Play again</button><button class="btn ghost block" data-done>Done</button></div>`;
    A.$('[data-again]', p.body).addEventListener('click', again);
    A.$('[data-done]', p.body).addEventListener('click', () => p.close());
  }

  const kanaCells = (script) => (script === 'k' ? KATAKANA_ROWS : HIRAGANA_ROWS).slice(0, 11).flatMap((r) => r.cells).filter((c) => c.k && !/[ぢづヂヅをヲ]/.test(c.k));

  // ── Kana Rain ──
  function kanaRain(script = A.state.games.rainScript || 'h') {
    let raf = null, alive = true;
    const p = A.panel('', { title: 'Kana Rain', onClose: () => { alive = false; cancelAnimationFrame(raf); A.go(A.tab); } });
    const intro = () => {
      p.body.innerHTML = `<div class="game-intro center"><div class="game-icon rain" lang="ja">あ</div><h1>Kana Rain</h1>
        <p class="muted">Kana fall from the sky. Tap the right romaji before they hit the ground! 3 lives — it gets faster as you go.</p>
        <div class="seg"><button class="${script === 'h' ? 'on' : ''}" data-s="h" lang="ja">ひらがな</button><button class="${script === 'k' ? 'on' : ''}" data-s="k" lang="ja">カタカナ</button></div>
        ${best('rain') != null ? `<p class="muted small">Best: ${best('rain')}</p>` : ''}
        <button class="btn primary block lg" data-go-game>Start</button></div>`;
      p.body.onclick = (e) => {
        const s = e.target.closest('[data-s]');
        if (s) { script = s.dataset.s; A.state.games.rainScript = script; A.save(); intro(); }
        if (e.target.closest('[data-go-game]')) play();
      };
    };
    const play = () => {
      p.body.onclick = null;
      const cells = kanaCells(script);
      let score = 0, lives = 3, drops = [], last = 0, spawnIn = 0, target = null;
      p.body.innerHTML = `<div class="rain-game">
        <div class="rain-hud"><span class="rain-lives" data-lives></span><b data-score>0</b><span class="muted small" data-lvl>Lv 1</span></div>
        <div class="rain-field" data-field><div class="rain-ground"></div></div>
        <div class="rain-btns" data-btns></div></div>`;
      const field = A.$('[data-field]', p.body), btns = A.$('[data-btns]', p.body);
      const level = () => 1 + Math.floor(score / 8);
      const paintHud = () => {
        A.$('[data-lives]', p.body).innerHTML = Array.from({ length: 3 }, (_, i) => `<span class="${i < lives ? 'on' : ''}">${A.icon('heart')}</span>`).join('');
        A.$('[data-score]', p.body).textContent = score;
        A.$('[data-lvl]', p.body).textContent = `Lv ${level()}`;
      };
      const setButtons = () => {
        const t = drops.reduce((m, d) => (!m || d.y > m.y ? d : m), null);
        if (t === target) return;
        target = t;
        if (!t) { btns.innerHTML = ''; return; }
        const opts = A.shuffle([t.c.r, ...A.sample(A.uniq(cells.map((c) => c.r).filter((r) => r !== t.c.r)), 3)]);
        btns.innerHTML = opts.map((o) => `<button class="rain-btn" data-r="${esc(o)}">${esc(o)}</button>`).join('');
        A.$$('.drop', field).forEach((el) => el.classList.toggle('target', el === t.el));
      };
      const spawn = () => {
        const c = A.pick(cells);
        const el = document.createElement('div');
        el.className = 'drop'; el.lang = 'ja'; el.textContent = c.k;
        const x = 8 + Math.random() * 74;
        el.style.left = `${x}%`;
        field.appendChild(el);
        drops.push({ c, el, y: -50, speed: 26 + level() * 7 + Math.random() * 10 });
      };
      btns.addEventListener('click', (e) => {
        const b = e.target.closest('[data-r]');
        if (!b || !target) return;
        if (b.dataset.r === target.c.r) {
          score++;
          A.sfx('pop'); A.speak(target.c.k);
          target.el.classList.add('burst');
          const el = target.el; setTimeout(() => el.remove(), 350);
          drops = drops.filter((d) => d !== target);
          target = null;
          if (score % 8 === 0) { A.sfx('taiko'); field.classList.add('level-up'); setTimeout(() => field.classList.remove('level-up'), 700); }
        } else {
          A.sfx('wrong'); b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 400);
          target.y += 30; // the wrong answer pushes it down
        }
        paintHud(); setButtons();
      });
      const H = () => field.clientHeight - 60;
      const frame = (t) => {
        if (!alive) return;
        const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
        spawnIn -= dt;
        if (spawnIn <= 0 && drops.length < 2 + Math.floor(level() / 2)) { spawn(); spawnIn = Math.max(0.9, 2.6 - level() * 0.22); }
        for (const d of drops) { d.y += d.speed * dt; d.el.style.transform = `translateY(${d.y}px)`; }
        const landed = drops.filter((d) => d.y >= H());
        if (landed.length) {
          landed.forEach((d) => { d.el.classList.add('splash'); setTimeout(() => d.el.remove(), 400); });
          drops = drops.filter((d) => d.y < H());
          lives -= landed.length; target = null;
          A.sfx('wrong'); field.classList.add('hit'); setTimeout(() => field.classList.remove('hit'), 400);
          paintHud();
          if (lives <= 0) { alive = false; return setTimeout(() => { alive = true; gameOver(p, { id: 'rain', score, label: 'Score', xp: Math.min(25, 2 + Math.floor(score / 2)), again: () => { alive = true; play(); } }); }, 500); }
        }
        setButtons();
        raf = requestAnimationFrame(frame);
      };
      paintHud();
      raf = requestAnimationFrame(frame);
    };
    intro();
  }

  // ── Memory ──
  function memory() {
    const p = A.panel('', { title: 'Memory', onClose: () => A.go(A.tab) });
    const play = () => {
      const pool = Object.values(A.items).filter((it) => (it.kind === 'word' || it.kind === 'kanji') && it.jp.length <= 4 && it.en.length <= 14);
      const known = pool.filter((it) => A.state.srs[it.id]);
      const picks = A.sample(known.length >= 6 ? known : pool, 6);
      const cards = A.shuffle(picks.flatMap((it) => [{ id: it.id, face: it.jp, jp: true, it }, { id: it.id, face: it.en, jp: false, it }]));
      let open = [], matched = 0, moves = 0, lock = false;
      const t0 = Date.now();
      p.body.innerHTML = `<div class="memory"><div class="mem-hud"><span>Moves <b data-moves>0</b></span><span>Time <b data-time>0</b>s</span></div>
        <div class="mem-grid">${cards.map((c, i) => `<button class="mem-card" data-i="${i}"><span class="mem-back" lang="ja">桜</span><span class="mem-face ${c.jp ? 'jp' : ''}" ${c.jp ? 'lang="ja"' : ''}>${esc(c.face)}</span></button>`).join('')}</div></div>`;
      const timer = setInterval(() => { const el = A.$('[data-time]', p.body); if (!el) return clearInterval(timer); el.textContent = Math.round((Date.now() - t0) / 1000); }, 500);
      A.$('.mem-grid', p.body).addEventListener('click', (e) => {
        const b = e.target.closest('[data-i]');
        if (!b || lock || b.classList.contains('flip')) return;
        const c = cards[+b.dataset.i];
        b.classList.add('flip'); A.sfx('tap');
        if (c.jp) A.speak(c.it.say);
        open.push(b);
        if (open.length < 2) return;
        moves++; A.$('[data-moves]', p.body).textContent = moves;
        const [x, y] = open.map((el) => cards[+el.dataset.i]);
        if (x.id === y.id && x.jp !== y.jp) {
          open.forEach((el) => el.classList.add('matched')); open = []; matched++;
          A.sfx('match'); A.srsMark(x.id, true);
          if (matched === picks.length) {
            clearInterval(timer);
            const secs = Math.round((Date.now() - t0) / 1000);
            setTimeout(() => gameOver(p, { id: 'memory', score: secs, label: 'Time', unit: 's', lowerIsBetter: true, xp: moves <= 9 ? 15 : 10, again: play }), 700);
          }
        } else {
          lock = true;
          setTimeout(() => { open.forEach((el) => el.classList.remove('flip')); open = []; lock = false; }, 850);
        }
      });
    };
    p.body.innerHTML = `<div class="game-intro center"><div class="game-icon memory" lang="ja">記</div><h1>Memory</h1>
      <p class="muted">Flip the cards and match each Japanese word with its meaning. Fewer moves, faster time!</p>
      ${best('memory') != null ? `<p class="muted small">Best time: ${best('memory')}s</p>` : ''}
      <button class="btn primary block lg" data-go-game>Start</button></div>`;
    A.$('[data-go-game]', p.body).addEventListener('click', play);
  }

  // ── Time Attack ──
  function blitz() {
    let timer = null;
    const p = A.panel('', { title: 'Time Attack', onClose: () => { clearInterval(timer); A.go(A.tab); } });
    const play = () => {
      const pool = Object.values(A.items).filter((it) => it.kind === 'word' && it.en.length <= 22);
      let left = 60, score = 0, streak = 0;
      p.body.innerHTML = `<div class="blitz"><div class="blitz-hud"><b class="blitz-time" data-t>60</b><div class="blitz-bar"><i data-bar></i></div><b data-s>0</b></div>
        <div class="blitz-q" lang="ja" data-q></div><div class="blitz-streak" data-streak></div><div class="blitz-opts" data-opts></div></div>`;
      const q = () => {
        const it = A.pick(pool);
        const opts = A.shuffle([it.en, ...A.sample(A.uniq(pool.filter((x) => x.en !== it.en).map((x) => x.en)), 3)]);
        A.$('[data-q]', p.body).textContent = it.jp;
        A.$('[data-q]', p.body).classList.remove('in'); void p.body.offsetWidth; A.$('[data-q]', p.body).classList.add('in');
        A.$('[data-opts]', p.body).innerHTML = opts.map((o) => `<button class="blitz-opt" data-o="${esc(o)}" data-ok="${o === it.en ? 1 : 0}">${esc(o)}</button>`).join('');
      };
      A.$('[data-opts]', p.body).addEventListener('click', (e) => {
        const b = e.target.closest('[data-o]');
        if (!b || left <= 0) return;
        if (b.dataset.ok === '1') {
          streak++; score += streak >= 5 ? 2 : 1;
          A.sfx(streak % 5 === 0 ? 'taiko' : 'pop');
          if (streak % 5 === 0) { left = Math.min(60, left + 3); }
        } else {
          streak = 0; left = Math.max(0, left - 3);
          A.sfx('wrong'); p.body.querySelector('.blitz').classList.add('hit'); setTimeout(() => p.body.querySelector('.blitz')?.classList.remove('hit'), 300);
        }
        A.$('[data-s]', p.body).textContent = score;
        A.$('[data-streak]', p.body).innerHTML = streak >= 3 ? `<span lang="ja">連</span> ${streak}${streak >= 5 ? ' · double points!' : ''}` : '';
        q();
      });
      const tick = () => {
        A.$('[data-t]', p.body).textContent = Math.ceil(left);
        A.$('[data-bar]', p.body).style.width = `${(left / 60) * 100}%`;
        A.$('[data-t]', p.body).classList.toggle('low', left <= 10);
      };
      timer = setInterval(() => {
        left -= 0.25; tick();
        if (left <= 0) { clearInterval(timer); gameOver(p, { id: 'blitz', score, label: 'Score', xp: Math.min(25, 2 + score), again: play }); }
      }, 250);
      q(); tick();
    };
    p.body.innerHTML = `<div class="game-intro center"><div class="game-icon blitz" lang="ja">速</div><h1>Time Attack</h1>
      <p class="muted">60 seconds. Pick the meaning of as many words as you can. 5 in a row = double points and +3 seconds; a mistake costs 3 seconds.</p>
      ${best('blitz') != null ? `<p class="muted small">Best: ${best('blitz')}</p>` : ''}
      <button class="btn primary block lg" data-go-game>Start</button></div>`;
    A.$('[data-go-game]', p.body).addEventListener('click', play);
  }

  A.openGames = () => {
    const s = A.sheet(`<div class="sheet-body"><h2>Mini-games</h2><p class="muted">Quick, fun rounds that earn XP and count for your quests.</p>
      <div class="game-list">
        <button class="game-tile rain" data-g="rain"><span lang="ja">あ</span><b>Kana Rain</b><small>${best('rain') != null ? `Best ${best('rain')}` : 'Catch falling kana'}</small></button>
        <button class="game-tile memory" data-g="memory"><span lang="ja">記</span><b>Memory</b><small>${best('memory') != null ? `Best ${best('memory')}s` : 'Flip & match'}</small></button>
        <button class="game-tile blitz" data-g="blitz"><span lang="ja">速</span><b>Time Attack</b><small>${best('blitz') != null ? `Best ${best('blitz')}` : '60-second blitz'}</small></button>
      </div><button class="btn primary block" data-close>Close</button></div>`);
    s.el.addEventListener('click', (e) => {
      const g = e.target.closest('[data-g]');
      if (!g) return;
      s.close(); A.sfx('tap');
      ({ rain: kanaRain, memory, blitz })[g.dataset.g]();
    });
  };
})(window.A);
