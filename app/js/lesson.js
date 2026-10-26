// Lessons: builds a mix of exercises for a set of items, then plays them full-screen.
(function (A) {
  const esc = A.esc;
  const PRAISE = ['Nice!', 'Great job!', 'Excellent!', 'Correct!', 'すごい！', 'Awesome!', 'Perfect!'];
  const MAX_EXERCISES = 15;

  // ── Exercise builders ──
  const label = (it, side) => (side === 'jp' ? it.jp : it.en);
  // `pool` supplies plausible wrong answers (same unit/kind where possible)
  function options(it, pool, side, n = 4) {
    const correct = label(it, side);
    const others = A.shuffle(A.uniq(pool.filter((p) => p.kind === it.kind && p.id !== it.id).map((p) => label(p, side)).filter((l) => l && l !== correct)));
    const fallback = A.shuffle(A.uniq(Object.values(A.items).filter((p) => p.kind === it.kind).map((p) => label(p, side)).filter((l) => l && l !== correct && !others.includes(l))));
    const opts = A.shuffle([correct, ...[...others, ...fallback].slice(0, n - 1)]);
    return { options: opts, answer: opts.indexOf(correct) };
  }

  const ex = {
    intro: (it) => ({ type: 'intro', item: it }),
    meaning: (it, pool) => ({ type: 'choice', item: it, title: it.kind === 'kana' ? 'What sound is this?' : it.kind === 'sentence' ? 'What does this mean?' : 'Select the meaning', prompt: it.jp, promptJp: true, say: it.say, ...options(it, pool, 'en'), optJp: false }),
    reverse: (it, pool) => ({ type: 'choice', item: it, title: it.kind === 'kana' ? `Which one is “${it.en}”?` : `Select “${it.en}” in Japanese`, prompt: '', ...options(it, pool, 'jp'), optJp: true, grid: it.kind === 'kana' || it.kind === 'kanji' }),
    listen: (it, pool) => ({ type: 'choice', item: it, title: 'Tap what you hear', listen: true, say: it.say, ...options(it, pool, 'jp', it.kind === 'sentence' ? 3 : 4), optJp: true, grid: it.kind === 'kana' }),
    reading: (it, pool) => {
      const opts = A.shuffle([it.read, ...A.shuffle(A.uniq(pool.filter((p) => p.kind === 'kanji' && p.read && p.read !== it.read).map((p) => p.read))).slice(0, 3)]);
      return { type: 'choice', item: it, title: 'How is this kanji read?', prompt: it.jp, promptJp: true, options: opts, answer: opts.indexOf(it.read), optJp: true };
    },
    buildEn: (it, pool) => {
      const words = (s) => s.replace(/[.,!?;:"“”]/g, '').split(/\s+/).filter(Boolean);
      const answer = words(it.en);
      const extra = A.shuffle(A.uniq(pool.filter((p) => p.kind === 'sentence' && p.id !== it.id).flatMap((p) => words(p.en))).filter((w) => !answer.some((a) => a.toLowerCase() === w.toLowerCase()))).slice(0, Math.min(4, Math.max(2, 8 - answer.length)));
      return { type: 'build', item: it, title: 'Translate this sentence', prompt: it.jp, promptJp: true, say: it.say, answer, tiles: A.shuffle([...answer, ...extra]), tileJp: false };
    },
    buildJp: (it, pool) => {
      const chunks = (s) => s.replace(/[。！？、]/g, ' ').split(/\s+/).filter(Boolean);
      const answer = chunks(it.jp);
      const extra = A.shuffle(A.uniq(pool.filter((p) => p.kind === 'sentence' && p.id !== it.id).flatMap((p) => chunks(p.jp))).filter((w) => !answer.includes(w))).slice(0, 3);
      return { type: 'build', item: it, title: 'Write this in Japanese', prompt: it.en, promptJp: false, say: it.say, answer, tiles: A.shuffle([...answer, ...extra]), tileJp: true };
    },
    match: (list) => ({ type: 'match', items: list }),
    fill: (q) => {
      const order = A.shuffle(q.opts.map((_, i) => i));
      return { type: 'fill', q, options: order.map((i) => q.opts[i]), answer: order.indexOf(q.ans), say: q.sentence.map((p, k) => (k === q.blank ? q.opts[q.ans] : p)).join('').replace(/ — .*/, '') };
    },
  };

  const canBuildJp = (it) => it.jp.replace(/[。！？、]/g, ' ').split(/\s+/).filter(Boolean).length >= 2;
  function practiceOne(it, pool, hard) {
    if (it.kind === 'kana') return hard ? A.pick([ex.reverse, ex.listen])(it, pool) : ex.meaning(it, pool);
    if (it.kind === 'kanji') return hard ? A.pick([ex.reverse, it.read ? ex.reading : ex.meaning])(it, pool) : ex.meaning(it, pool);
    if (it.kind === 'sentence') return hard ? A.pick([ex.buildEn, canBuildJp(it) ? ex.buildJp : ex.listen, ex.listen])(it, pool) : A.pick([ex.meaning, ex.buildEn])(it, pool);
    return hard ? A.pick([ex.reverse, ex.listen])(it, pool) : ex.meaning(it, pool);
  }

  // A lesson: introduce each new item, practise it, then mix in harder rounds and review.
  A.buildLesson = (lesson) => {
    const unit = lesson.unit;
    const fresh = lesson.items;
    const earlier = unit.lessons.slice(0, lesson.index).flatMap((l) => l.items);
    const pool = unit.items.length >= 6 ? unit.items : [...unit.items, ...A.allLessons.flatMap((l) => l.items).filter((x) => x.kind === fresh[0].kind)];
    const review = A.sample(earlier, Math.min(3, earlier.length));
    const first = [], rest = [];
    fresh.forEach((it) => {
      if (!A.state.srs[it.id]) first.push(ex.intro(it));
      first.push(practiceOne(it, pool, false));
    });
    fresh.forEach((it) => rest.push(practiceOne(it, pool, true)));
    const matchable = [...fresh, ...review].filter((x) => x.kind !== 'sentence');
    if (matchable.length >= 4) rest.push(ex.match(A.sample(matchable, Math.min(5, matchable.length))));
    review.forEach((it) => rest.push(practiceOne(it, pool, true)));
    if (unit.fills?.length) A.sample(unit.fills, 2).forEach((q) => rest.push(ex.fill(q)));
    return [...first, ...A.shuffle(rest)].slice(0, MAX_EXERCISES + fresh.length);
  };

  // A practice session from any list of items (review, mistakes, listening…)
  A.buildPractice = (list, { kinds } = {}) => {
    const its = list.filter(Boolean);
    const out = its.map((it) => {
      const pool = A.UNITS.find((u) => u.id === it.unit)?.items || its;
      if (kinds === 'listen') return it.kind === 'kanji' ? ex.meaning(it, pool) : ex.listen(it, pool);
      return practiceOne(it, pool, Math.random() > 0.4);
    });
    const matchable = its.filter((x) => x.kind !== 'sentence');
    if (kinds !== 'listen' && matchable.length >= 5) out.splice(Math.floor(out.length / 2), 0, ex.match(A.sample(matchable, 5)));
    return out;
  };

  // ── Player ──
  // A.play({ exercises, title, hearts, xp, onDone(result) })
  A.play = (cfg) => {
    const total = cfg.exercises.length;
    const queue = cfg.exercises.map((e) => ({ ...e, retried: false }));
    let done = 0, mistakes = 0, current = null, answered = false;
    const started = Date.now();
    const useHearts = cfg.hearts !== false;

    const root = document.createElement('div');
    root.className = 'lesson';
    root.innerHTML = `
      <header class="lesson-top">
        <button class="icon-btn" data-quit aria-label="Quit lesson">${A.icon('x')}</button>
        <div class="lesson-bar"><span data-bar></span></div>
        ${useHearts ? `<span class="hearts" data-hearts>${A.icon('heart')}<b>${A.hearts()}</b></span>` : `<span class="hearts practice">${A.icon('dumbbell')}</span>`}
      </header>
      <main class="lesson-body" data-body></main>
      <footer class="lesson-foot" data-foot></footer>`;
    document.body.appendChild(root);
    document.body.classList.add('in-lesson');
    const body = A.$('[data-body]', root), foot = A.$('[data-foot]', root);

    const close = () => { A.speakStop(); root.remove(); document.body.classList.remove('in-lesson'); };
    A.$('[data-quit]', root).addEventListener('click', () => {
      if (done === 0) { close(); cfg.onDone && cfg.onDone(null); return; }
      const s = A.sheet(`<div class="sheet-body center">${A.owl('sad')}<h2>Wait, don’t go!</h2><p class="muted">You’ll lose your progress in this lesson if you quit now.</p>
        <button class="btn primary block" data-close>Keep learning</button><button class="btn ghost danger block" data-end>End session</button></div>`);
      A.$('[data-end]', s.el).addEventListener('click', () => { s.close(); close(); cfg.onDone && cfg.onDone(null); });
    });

    const bar = () => { A.$('[data-bar]', root).style.width = `${(done / total) * 100}%`; };
    const footCheck = (enabled) => { foot.className = 'lesson-foot'; foot.innerHTML = `<button class="btn primary block lg" data-check ${enabled ? '' : 'disabled'}>Check</button>`; A.$('[data-check]', foot).addEventListener('click', check); };
    const enableCheck = () => { const b = A.$('[data-check]', foot); if (b) b.disabled = false; };

    function next() {
      answered = false;
      bar();
      if (!queue.length) return finish(true);
      current = queue.shift();
      body.scrollTop = 0;
      render[current.type](current);
    }

    const speakerBtn = (text, big) => `<button class="speaker ${big ? 'big' : ''}" data-say="${esc(text)}" aria-label="Play audio">${A.icon('volume')}</button>${big ? `<button class="speaker slow" data-say="${esc(text)}" data-slow aria-label="Play slowly">${A.icon('turtle')}</button>` : ''}`;
    body.addEventListener('click', (e) => { const s = e.target.closest('[data-say]'); if (s) { A.speak(s.dataset.say, s.hasAttribute('data-slow')); s.classList.add('pulse'); setTimeout(() => s.classList.remove('pulse'), 600); } });
    const hint = (it) => (A.state.profile.romaji && it.read && it.kind !== 'kana' ? `<div class="romaji">${esc(it.read)}</div>` : '');

    const render = {
      intro(e) {
        const it = e.item;
        body.innerHTML = `<div class="ex">
          <div class="ex-tag new">${A.icon('star')} New ${it.kind === 'kana' ? 'character' : it.kind === 'sentence' ? 'phrase' : it.kind}</div>
          <div class="intro-card">
            <div class="intro-jp ${it.jp.length > 6 ? 'long' : ''}" lang="ja">${esc(it.jp)}</div>
            ${it.read ? `<div class="intro-read">${esc(it.read)}</div>` : ''}
            <div class="intro-en">${esc(it.en)}</div>
            <div class="row center">${speakerBtn(it.say, true)}</div>
            ${it.words?.length ? `<div class="intro-words">${it.words.slice(0, 2).map((w) => `<span lang="ja">${esc(w.jp)}</span> ${esc(w.read)} · ${esc(w.en)}`).join('<br>')}</div>` : ''}
          </div></div>`;
        A.speak(it.say);
        foot.className = 'lesson-foot';
        foot.innerHTML = '<button class="btn primary block lg" data-cont>Continue</button>';
        A.$('[data-cont]', foot).addEventListener('click', () => { A.srsMark(it.id, true); A.save(); done++; next(); });
      },
      choice(e) {
        let sel = -1;
        body.innerHTML = `<div class="ex">
          <h2 class="ex-title">${esc(e.title)}</h2>
          ${e.listen ? `<div class="listen-row">${speakerBtn(e.say, true)}</div>` : ''}
          ${e.prompt ? `<div class="prompt-row"><div class="bubble-prompt"><span class="${e.promptJp ? 'jp' : ''} ${e.prompt.length > 8 ? 'small' : ''}" lang="${e.promptJp ? 'ja' : 'en'}">${esc(e.prompt)}</span>${e.promptJp && e.item ? hint(e.item) : ''}</div>${e.say && !e.listen ? speakerBtn(e.say) : ''}</div>` : ''}
          <div class="choices ${e.grid ? 'grid' : ''}">${e.options.map((o, i) => `<button class="choice" data-i="${i}"><span class="num">${i + 1}</span><span class="${e.optJp ? 'jp' : ''}" ${e.optJp ? 'lang="ja"' : ''}>${esc(o)}</span></button>`).join('')}</div></div>`;
        if (e.say && (e.listen || e.promptJp)) setTimeout(() => A.speak(e.say), 150);
        footCheck(false);
        A.$$('.choice', body).forEach((b) => b.addEventListener('click', () => {
          if (answered) return;
          sel = +b.dataset.i;
          A.$$('.choice', body).forEach((x) => x.classList.toggle('sel', x === b));
          A.sfx('tap');
          if (e.optJp) A.speak(e.options[sel]);
          enableCheck();
        }));
        e.evaluate = () => ({ ok: sel === e.answer, solution: e.options[e.answer], solutionJp: e.optJp, meaning: e.item ? (e.optJp ? e.item.en : e.item.jp) : '' });
      },
      build(e) {
        const chosen = [];
        body.innerHTML = `<div class="ex">
          <h2 class="ex-title">${esc(e.title)}</h2>
          <div class="prompt-row">${A.owl('mini')}<div class="bubble-prompt speech"><span class="${e.promptJp ? 'jp small' : ''}" lang="${e.promptJp ? 'ja' : 'en'}">${esc(e.prompt)}</span>${e.promptJp ? hint(e.item) : ''}</div>${speakerBtn(e.say)}</div>
          <div class="answer-line" data-line></div>
          <div class="tiles" data-tiles>${e.tiles.map((t, i) => `<button class="tile ${e.tileJp ? 'jp' : ''}" data-t="${i}" ${e.tileJp ? 'lang="ja"' : ''}>${esc(t)}</button>`).join('')}</div></div>`;
        if (e.promptJp) setTimeout(() => A.speak(e.say), 150);
        footCheck(false);
        const line = A.$('[data-line]', body);
        const paint = () => {
          line.innerHTML = chosen.map((i) => `<button class="tile placed ${e.tileJp ? 'jp' : ''}" data-p="${i}" ${e.tileJp ? 'lang="ja"' : ''}>${esc(e.tiles[i])}</button>`).join('');
          A.$$('[data-t]', body).forEach((b) => b.classList.toggle('used', chosen.includes(+b.dataset.t)));
          const c = A.$('[data-check]', foot); if (c) c.disabled = !chosen.length;
        };
        body.addEventListener('click', (ev) => {
          if (answered) return;
          const t = ev.target.closest('[data-t]'), p = ev.target.closest('[data-p]');
          if (t && !chosen.includes(+t.dataset.t)) { chosen.push(+t.dataset.t); A.sfx('tap'); if (e.tileJp) A.speak(e.tiles[+t.dataset.t]); paint(); }
          if (p) { chosen.splice(chosen.indexOf(+p.dataset.p), 1); paint(); }
        });
        const norm = (arr) => arr.join(' ').toLowerCase();
        e.evaluate = () => ({ ok: norm(chosen.map((i) => e.tiles[i])) === norm(e.answer), solution: e.tileJp ? e.item.jp : e.item.en, solutionJp: e.tileJp, meaning: e.tileJp ? e.item.en : e.item.jp });
      },
      fill(e) {
        let sel = -1;
        const q = e.q;
        const sentence = () => q.sentence.map((p, k) => (k === q.blank ? `<span class="blank ${sel >= 0 ? 'filled' : ''}" lang="ja">${sel >= 0 ? esc(e.options[sel]) : ''}</span>` : `<span lang="ja">${esc(p)}</span>`)).join('');
        body.innerHTML = `<div class="ex">
          <h2 class="ex-title">Complete the sentence</h2>
          <div class="fill-sentence" data-s>${sentence()}</div>
          <div class="muted center">${esc(q.eng)}</div>
          <div class="tiles center">${e.options.map((o, i) => `<button class="tile jp" data-o="${i}" lang="ja">${esc(o)}</button>`).join('')}</div></div>`;
        footCheck(false);
        A.$$('[data-o]', body).forEach((b) => b.addEventListener('click', () => {
          if (answered) return;
          sel = +b.dataset.o;
          A.$$('[data-o]', body).forEach((x) => x.classList.toggle('sel', x === b));
          A.$('[data-s]', body).innerHTML = sentence();
          A.sfx('tap'); enableCheck();
        }));
        e.evaluate = () => ({ ok: sel === e.answer, solution: e.say, solutionJp: true, meaning: `${q.hint}` });
      },
      match(e) {
        const left = A.shuffle(e.items), right = A.shuffle(e.items);
        let pickL = null, pickR = null, matched = 0, slips = 0;
        body.innerHTML = `<div class="ex">
          <h2 class="ex-title">Tap the matching pairs</h2>
          <div class="match">
            <div class="match-col">${left.map((it) => `<button class="tile match-tile jp" data-l="${esc(it.id)}" lang="ja">${esc(it.jp)}</button>`).join('')}</div>
            <div class="match-col">${right.map((it) => `<button class="tile match-tile" data-r="${esc(it.id)}">${esc(it.en)}</button>`).join('')}</div>
          </div></div>`;
        foot.className = 'lesson-foot'; foot.innerHTML = '<button class="btn primary block lg" disabled>Check</button>';
        const tryMatch = () => {
          if (!pickL || !pickR) return;
          const a = A.$(`[data-l="${CSS.escape(pickL)}"]`, body), b = A.$(`[data-r="${CSS.escape(pickR)}"]`, body);
          if (pickL === pickR) {
            a.classList.add('done'); b.classList.add('done'); a.disabled = b.disabled = true; A.sfx('match'); matched++;
            A.srsMark(pickL, true);
            if (matched === e.items.length) { A.save(); setTimeout(() => answer({ ok: true, solution: '', quiet: true }, slips === 0), 300); }
          } else {
            slips++; A.sfx('wrong'); A.srsMark(pickL, false);
            [a, b].forEach((x) => { x.classList.add('bad'); setTimeout(() => x.classList.remove('bad', 'sel'), 500); });
          }
          pickL = pickR = null;
          setTimeout(() => A.$$('.match-tile.sel', body).forEach((x) => x.classList.remove('sel')), 0);
        };
        body.addEventListener('click', (ev) => {
          const l = ev.target.closest('[data-l]'), r = ev.target.closest('[data-r]');
          if (l && !l.disabled) { pickL = l.dataset.l; A.$$('[data-l]', body).forEach((x) => x.classList.toggle('sel', x === l)); A.speak(A.items[pickL].say); tryMatch(); }
          if (r && !r.disabled) { pickR = r.dataset.r; A.$$('[data-r]', body).forEach((x) => x.classList.toggle('sel', x === r)); A.sfx('tap'); tryMatch(); }
        });
      },
    };

    function check() {
      if (answered || !current.evaluate) return;
      const r = current.evaluate();
      if (current.item) { A.srsMark(current.item.id, r.ok); A.save(); }
      answer(r);
    }

    function answer(r, perfectMatch) {
      answered = true;
      if (r.ok) { done++; A.sfx('correct'); }
      else {
        mistakes++; A.sfx('wrong');
        if (!current.retried) queue.push({ ...current, retried: true, evaluate: null });
        if (useHearts) {
          A.loseHeart();
          const h = A.$('[data-hearts]', root);
          if (h) { h.innerHTML = `${A.icon('heart')}<b>${A.hearts()}</b>`; h.classList.add('shake'); setTimeout(() => h.classList.remove('shake'), 500); }
        }
      }
      if (r.quiet && r.ok) { bar(); setTimeout(next, perfectMatch ? 200 : 200); return; }
      bar();
      foot.className = `lesson-foot feedback ${r.ok ? 'good' : 'bad'}`;
      foot.innerHTML = `<div class="fb">
          <div class="fb-head"><span class="fb-icon">${A.icon(r.ok ? 'check' : 'x')}</span><b>${r.ok ? esc(A.pick(PRAISE)) : 'Correct solution:'}</b></div>
          ${!r.ok ? `<div class="fb-solution ${r.solutionJp ? 'jp' : ''}" ${r.solutionJp ? 'lang="ja"' : ''}>${esc(r.solution)}</div>` : ''}
          ${r.meaning ? `<div class="fb-meaning" ${/[ぁ-ん一-龯ァ-ン]/.test(r.meaning) ? 'lang="ja"' : ''}>${esc(r.meaning)}</div>` : ''}
        </div>
        <button class="btn ${r.ok ? 'success' : 'danger'} block lg" data-cont>${r.ok ? 'Continue' : 'Got it'}</button>`;
      if (current.item && current.item.say && (r.solutionJp || current.item.kind !== 'sentence')) setTimeout(() => A.speak(current.item.say), 250);
      A.$('[data-cont]', foot).addEventListener('click', () => {
        if (useHearts && A.hearts() === 0) return finish(false);
        next();
      });
    }

    function finish(completed) {
      bar();
      const secs = Math.round((Date.now() - started) / 1000);
      const acc = Math.max(0, Math.round(((done) / Math.max(1, done + mistakes)) * 100));
      if (!completed) {
        A.sfx('wrong');
        body.innerHTML = `<div class="ex center result">${A.owl('sad big')}<h1>Out of hearts</h1><p class="muted">Hearts refill one every 30 minutes — or earn one now with a quick practice session.</p></div>`;
        foot.className = 'lesson-foot';
        foot.innerHTML = '<button class="btn primary block lg" data-p>Practice to earn a heart</button><button class="btn ghost block" data-q>No thanks</button>';
        A.$('[data-p]', foot).addEventListener('click', () => { close(); cfg.onDone && cfg.onDone({ outOfHearts: true, practice: true }); });
        A.$('[data-q]', foot).addEventListener('click', () => { close(); cfg.onDone && cfg.onDone({ outOfHearts: true }); });
        return;
      }
      const xp = (cfg.xp || 10) + (mistakes === 0 ? 5 : 0);
      const before = A.streak();
      const extended = A.addXp(xp);
      A.sfx('complete'); A.confetti();
      body.innerHTML = `<div class="ex center result">
        ${A.owl('cheer big')}
        <h1>${mistakes === 0 ? 'Perfect lesson!' : esc(cfg.doneTitle || 'Lesson complete!')}</h1>
        <div class="stat-tiles">
          <div class="stat-tile xp"><span>Total XP</span><b>${A.icon('bolt')}${xp}</b></div>
          <div class="stat-tile acc"><span>${acc >= 90 ? 'Amazing' : acc >= 70 ? 'Good' : 'Accuracy'}</span><b>${A.icon('target')}${acc}%</b></div>
          <div class="stat-tile time"><span>Time</span><b>⏱ ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
        </div></div>`;
      foot.className = 'lesson-foot';
      foot.innerHTML = '<button class="btn primary block lg" data-cont>Continue</button>';
      A.$('[data-cont]', foot).addEventListener('click', () => {
        if (extended) {
          const n = A.streak().n;
          body.innerHTML = `<div class="ex center result"><div class="streak-big">${A.icon('flame')}<b>${n}</b></div><h1>day streak!</h1>
            <p class="muted">${before.n === 0 ? 'You started a streak! Come back tomorrow to keep it going.' : 'You extended your streak. 続けよう — keep it up!'}</p>
            <div class="week-dots">${weekDots()}</div></div>`;
          A.sfx('correct');
          foot.innerHTML = '<button class="btn primary block lg" data-ok>Continue</button>';
          A.$('[data-ok]', foot).addEventListener('click', () => { close(); cfg.onDone && cfg.onDone({ xp, mistakes, acc }); });
        } else { close(); cfg.onDone && cfg.onDone({ xp, mistakes, acc }); }
      });
    }

    next();
  };

  function weekDots() {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const on = (A.state.daily[A.dayKey(d)] || 0) > 0;
      out.push(`<span class="${on ? 'on' : ''} ${i === 0 ? 'today' : ''}"><i>${on ? A.icon('check') : ''}</i>${days[d.getDay()]}</span>`);
    }
    return out.join('');
  }
  A.weekDots = weekDots;
  A.speakStop = () => { try { speechSynthesis.cancel(); } catch (e) {} };
})(window.A);
