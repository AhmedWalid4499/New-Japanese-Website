// Making the app feel alive: haptics, flying rewards, Maru's lines, daily quests with omamori charms,
// and the weekly league.
(function (A) {
  const esc = A.esc;
  const S = A.state;

  // ── Haptics ──
  // Android/Chrome: Vibration API. iPhone (iOS 18+): toggling a hidden "switch" checkbox gives a light tap.
  const canVibrate = typeof navigator.vibrate === 'function';
  let sw = null;
  const tick = () => {
    if (!sw) {
      sw = document.createElement('label');
      sw.setAttribute('aria-hidden', 'true');
      sw.style.cssText = 'position:fixed;left:-200px;top:0;opacity:0;pointer-events:none';
      sw.innerHTML = '<input type="checkbox" switch tabindex="-1">';
      document.body.appendChild(sw);
    }
    sw.click();
  };
  const PATTERNS = { tap: [8], good: [14], bad: [30, 60, 30], combo: [12, 40, 12, 40, 24], big: [20, 60, 40, 60, 60] };
  A.haptic = (kind = 'tap') => {
    if (S.profile.haptics === false) return;
    const p = PATTERNS[kind] || PATTERNS.tap;
    try {
      if (canVibrate) { navigator.vibrate(p); return; }
      const n = Math.ceil(p.length / 2);
      for (let k = 0; k < n; k++) setTimeout(tick, k * 110);
    } catch (e) {}
  };
  // Every sound gets a matching haptic, even with sound turned off
  const HAPTIC_FOR = { correct: 'good', wrong: 'bad', tap: 'tap', match: 'tap', complete: 'big', taiko: 'combo', bell: 'big', coin: 'tap', chime: 'good', pop: 'tap' };
  const baseSfx = A.sfx;
  A.sfx = (kind) => { baseSfx(kind); if (HAPTIC_FOR[kind]) A.haptic(HAPTIC_FOR[kind]); };

  // ── Flying rewards: little icons that fly from a point into a counter ──
  A.fly = ({ from, to, icon = 'bolt', n = 8, cls = 'xp', onEach, onEnd }) => {
    const target = typeof to === 'string' ? A.$(to) : to;
    if (!target) { onEnd && onEnd(); return; }
    const tr = target.getBoundingClientRect();
    const start = from || { x: innerWidth / 2, y: innerHeight / 2 };
    let landed = 0;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('span');
      d.className = `flyer ${cls}`;
      d.innerHTML = A.icon(icon);
      document.body.appendChild(d);
      const sx = start.x + (Math.random() - 0.5) * 120, sy = start.y + (Math.random() - 0.5) * 80;
      const tx = tr.left + tr.width / 2 - 12, ty = tr.top + tr.height / 2 - 12;
      const mx = (sx + tx) / 2 + (Math.random() - 0.5) * 160, my = Math.min(sy, ty) - 60 - Math.random() * 80;
      const anim = d.animate([
        { transform: `translate(${sx}px,${sy}px) scale(.4)`, opacity: 0 },
        { transform: `translate(${sx}px,${sy - 20}px) scale(1.15)`, opacity: 1, offset: 0.15 },
        { transform: `translate(${mx}px,${my}px) scale(1)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${tx}px,${ty}px) scale(.55)`, opacity: 0.9 },
      ], { duration: 820 + Math.random() * 200, delay: i * 60, easing: 'cubic-bezier(.5,0,.4,1)', fill: 'forwards' });
      anim.onfinish = () => {
        d.remove(); landed++;
        target.classList.remove('bump'); void target.offsetWidth; target.classList.add('bump');
        A.sfx('coin');
        onEach && onEach(landed);
        if (landed === n) onEnd && onEnd();
      };
    }
  };
  // Count a number up inside an element
  A.countUp = (el, from, to, ms = 900) => {
    if (!el) return;
    const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  // Called after each screen renders: play any reward animation that's waiting
  A.pending = null;
  A.runPending = () => {
    const p = A.pending;
    if (!p) return;
    A.pending = null;
    setTimeout(() => {
      if (p.xp) {
        const b = A.$('.status.xp b');
        if (b) b.textContent = p.xpFrom;
        A.fly({ to: '.status.xp', icon: 'bolt', n: Math.min(10, Math.max(4, Math.round(p.xp / 2))), cls: 'xp', onEnd: () => A.countUp(b, p.xpFrom, S.xp, 600) });
      }
      if (p.petal) A.fly({ to: '.status.heart', icon: 'heart', n: 3, cls: 'petal' });
      if (p.quest) setTimeout(() => A.toast(p.quest), 900);
    }, 250);
  };

  // ── Maru talks ──
  const LINES = {
    good: [['すごい！', 'Amazing!'], ['いいね！', 'Nice!'], ['じょうず！', 'So skilful!'], ['そのちょうし！', 'Keep it up!'], ['やった！', 'You did it!'], ['かんぺき！', 'Perfect!']],
    bad: [['だいじょうぶ！', 'It’s okay!'], ['ドンマイ！', 'Don’t worry!'], ['おしい！', 'So close!'], ['つぎ がんばろう！', 'Next one!'], ['ゆっくりで いいよ', 'Take your time']],
    combo: [['とまらない！', 'Unstoppable!'], ['てんさい！', 'Genius!'], ['もえてる！', 'You’re on fire!'], ['さいこう！', 'The best!']],
    tap: [['にゃー！', 'Meow!'], ['がんばって！', 'You can do it!'], ['いっしょに べんきょうしよう！', 'Let’s study together!'], ['まねきねこ だよ', 'I’m a lucky cat'], ['きょうも いい ひ！', 'Another good day!'], ['しゅくだい した？', 'Done your homework?']],
  };
  A.maruLine = (kind) => A.pick(LINES[kind] || LINES.tap);
  // Speech bubble next to an element (Maru)
  A.maruSay = (el, [jp, en], { speak = true, ms = 2600 } = {}) => {
    if (!el) return;
    const host = el.closest('.maru-host') || el.parentElement;
    A.$$('.maru-bubble', host).forEach((b) => b.remove());
    const b = document.createElement('div');
    b.className = 'maru-bubble';
    b.innerHTML = `<b lang="ja">${esc(jp)}</b><small>${esc(en)}</small>`;
    host.appendChild(b);
    requestAnimationFrame(() => b.classList.add('show'));
    setTimeout(() => { b.classList.remove('show'); setTimeout(() => b.remove(), 300); }, ms);
    if (speak) A.speak(jp);
  };
  // Something personal to say when tapped on the path
  A.maruChat = () => {
    const st = A.streak(), goal = S.profile.goal, today = A.todayXp(), h = new Date().getHours();
    const opts = [A.maruLine('tap')];
    opts.push(h < 11 ? ['おはよう！', 'Good morning!'] : h < 18 ? ['こんにちは！', 'Hello!'] : ['こんばんは！', 'Good evening!']);
    if (st.n >= 2) opts.push([`${st.n}にち れんぞく！`, `${st.n} days in a row — your lantern is glowing!`]);
    if (today < goal) opts.push(['あと すこし！', `Only ${goal - today} XP to today’s goal!`]);
    else opts.push(['もくひょう たっせい！', 'Daily goal reached! 🎉']);
    const q = A.questsToday();
    const open = q.list.filter((x) => !q.done(x)).length;
    if (open) opts.push(['クエスト が あるよ', `${open} quest${open > 1 ? 's' : ''} left today — open a charm!`]);
    return A.pick(opts);
  };

  // ── Daily quests ──
  const QUESTS = [
    { id: 'xp30', ev: 'xp', n: 30, text: 'Earn 30 XP', glyph: '⚡' },
    { id: 'xp50', ev: 'xp', n: 50, text: 'Earn 50 XP', glyph: '⚡' },
    { id: 'lesson2', ev: 'lesson', n: 2, text: 'Complete 2 lessons', glyph: '道' },
    { id: 'perfect', ev: 'perfect', n: 1, text: 'Finish a lesson with no mistakes', glyph: '完' },
    { id: 'combo5', ev: 'combo', n: 5, max: true, text: 'Get 5 right in a row', glyph: '連' },
    { id: 'combo10', ev: 'combo', n: 10, max: true, text: 'Get 10 right in a row', glyph: '連' },
    { id: 'correct20', ev: 'correct', n: 20, text: 'Answer 20 questions correctly', glyph: '正' },
    { id: 'grammar', ev: 'grammar', n: 1, text: 'Complete a grammar lesson', glyph: '文' },
    { id: 'game', ev: 'game', n: 1, text: 'Play a mini-game', glyph: '遊' },
    { id: 'write5', ev: 'write', n: 5, text: 'Write 5 characters by hand', glyph: '書' },
    { id: 'speak3', ev: 'speak', n: 3, text: 'Say 3 sentences out loud', glyph: '声' },
    { id: 'read', ev: 'read', n: 1, text: 'Finish a story or dialogue', glyph: '読' },
  ];
  // Small seeded random generator so everyone gets the same quests on the same day
  const rng = (seed) => { let t = seed >>> 0; return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
  const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
  A.rng = rng; A.hash = hash;

  function questsState() {
    const day = A.dayKey();
    if (!S.quests || S.quests.day !== day) {
      const r = rng(hash(day));
      const pool = QUESTS.slice().sort(() => r() - 0.5);
      const ids = [], evs = new Set();
      for (const q of pool) { if (ids.length === 3) break; if (!evs.has(q.ev)) { ids.push(q.id); evs.add(q.ev); } }
      S.quests = { day, ids, prog: {}, claimed: {}, bonus: false };
    }
    return S.quests;
  }
  A.questsToday = () => {
    const qs = questsState();
    const list = qs.ids.map((id) => QUESTS.find((q) => q.id === id)).filter(Boolean);
    return { qs, list, prog: (q) => Math.min(q.n, qs.prog[q.id] || 0), done: (q) => (qs.prog[q.id] || 0) >= q.n, claimed: (q) => !!qs.claimed[q.id] };
  };
  // Record progress: A.quest('xp', 10) / A.quest('combo', 7)
  A.quest = (ev, n = 1) => {
    const { qs, list } = A.questsToday();
    list.filter((q) => q.ev === ev).forEach((q) => {
      const before = qs.prog[q.id] || 0;
      qs.prog[q.id] = q.max ? Math.max(before, n) : before + n;
      if (before < q.n && qs.prog[q.id] >= q.n) {
        const msg = `Quest complete: ${q.text}! Open your charm on the Path 🧧`;
        if (document.body.classList.contains('in-lesson')) A.pending = { ...(A.pending || {}), quest: msg };
        else { A.sfx('chime'); A.toast(msg); }
      }
    });
    A.save();
  };
  // XP counts towards XP quests
  const baseAddXp = A.addXp;
  A.addXp = (n) => { const r = baseAddXp(n); A.quest('xp', n); return r; };

  // The omamori (lucky charm) SVG
  A.omamori = (cls = '', gold = false) => `<svg class="omamori ${cls}" viewBox="0 0 100 140" aria-hidden="true">
    <path d="M50 6c-8 0-10 8-6 12l6 6 6-6c4-4 2-12-6-12z" fill="none" stroke="${gold ? '#c9922a' : '#c23a3a'}" stroke-width="3"/>
    <rect x="18" y="22" width="64" height="108" rx="14" fill="${gold ? '#e8b84a' : '#d9577c'}"/>
    <rect x="24" y="28" width="52" height="96" rx="10" fill="none" stroke="#fff8" stroke-width="2" stroke-dasharray="4 4"/>
    <path d="M18 44h64" stroke="#fff6" stroke-width="3"/>
    <rect x="34" y="56" width="32" height="52" rx="4" fill="#fffaf2"/>
    <text x="50" y="80" text-anchor="middle" font-size="20" font-family="serif" fill="${gold ? '#9c7a2a' : '#b03f60'}">${gold ? '福' : '学'}</text>
    <text x="50" y="102" text-anchor="middle" font-size="14" font-family="serif" fill="${gold ? '#9c7a2a' : '#b03f60'}">守</text></svg>`;

  // Open a charm: shake, burst, reveal a reward
  A.openCharm = ({ gold = false, onDone } = {}) => {
    const roll = Math.random();
    const reward = gold ? { xp: 30, petal: A.MAX_HEARTS } : roll < 0.22 && A.hearts() < A.MAX_HEARTS ? { petal: 1 } : { xp: A.pick([10, 15, 15, 20, 25]) };
    const s = A.sheet(`<div class="sheet-body center charm-sheet">
      <p class="muted" data-hint>Tap the charm to open it!</p>
      <button class="charm-btn" data-open>${A.omamori('shake', gold)}</button>
      <div class="charm-reward" data-reward hidden></div>
      <button class="btn primary block" data-close data-collect hidden>Collect</button></div>`, { onClose: () => { onDone && onDone(); } });
    const btn = A.$('[data-open]', s.el);
    let opened = false;
    btn.addEventListener('click', () => {
      if (opened) return; opened = true;
      A.sfx('taiko');
      btn.classList.add('opening');
      setTimeout(() => {
        A.sfx('bell'); A.confetti();
        const xpFrom = S.xp;
        if (reward.xp) A.addXp(reward.xp);
        if (reward.petal) A.gainHeart(reward.petal);
        A.save();
        A.pending = { xp: reward.xp || 0, xpFrom, petal: !!reward.petal };
        btn.classList.add('opened');
        A.$('[data-hint]', s.el).hidden = true;
        const r = A.$('[data-reward]', s.el);
        r.hidden = false;
        r.innerHTML = `<div class="reward-pop">${reward.xp ? `<span class="rw xp">${A.icon('bolt')}+${reward.xp} XP</span>` : ''}${reward.petal ? `<span class="rw petal">${A.icon('heart')}${gold ? 'Petals refilled!' : '+1 petal'}</span>` : ''}</div>
          <p class="muted">${gold ? 'All of today’s quests done — たいへん よくできました！' : 'お守り — a lucky charm for your studies.'}</p>`;
        A.$('[data-collect]', s.el).hidden = false;
      }, 700);
    });
  };
  A.claimQuest = (id, done) => {
    const { qs, list } = A.questsToday();
    if (qs.claimed[id]) return;
    qs.claimed[id] = true; A.save();
    A.openCharm({ onDone: () => {
      const allClaimed = list.every((q) => qs.claimed[q.id]);
      if (allClaimed && !qs.bonus) { qs.bonus = true; A.save(); setTimeout(() => A.openCharm({ gold: true, onDone: done }), 350); }
      else done && done();
    } });
  };
  // Quest card for the Path screen
  A.questCard = () => {
    const { list, prog, done, claimed, qs } = A.questsToday();
    const left = list.filter((q) => !claimed(q)).length;
    return `<section class="quest-card ${left ? '' : 'all-done'}">
      <div class="quest-head"><b>Today’s quests</b><span class="muted small">${left ? `${list.length - left}/${list.length} charms opened` : qs.bonus ? 'All done — see you tomorrow!' : ''}</span></div>
      ${list.map((q) => `<div class="quest ${done(q) ? 'done' : ''} ${claimed(q) ? 'claimed' : ''}">
        <span class="q-glyph" lang="ja">${q.glyph}</span>
        <div class="q-text"><span>${esc(q.text)}</span><div class="q-bar"><i style="width:${(prog(q) / q.n) * 100}%"></i></div></div>
        ${claimed(q) ? `<span class="q-state">${A.icon('check')}</span>` : done(q) ? `<button class="q-claim" data-claim="${q.id}" aria-label="Open charm">${A.omamori('mini wiggle')}</button>` : `<span class="q-count">${prog(q)}/${q.n}</span>`}
      </div>`).join('')}</section>`;
  };

  // ── Weekly league ──
  const TIERS = [
    { name: 'Sakura', jp: '桜', color: '#d9577c', base: 60 },
    { name: 'Bamboo', jp: '竹', color: '#5f8a37', base: 120 },
    { name: 'Pine', jp: '松', color: '#1d8676', base: 200 },
    { name: 'Crane', jp: '鶴', color: '#3b5a8c', base: 300 },
    { name: 'Fuji', jp: '富士', color: '#c9922a', base: 450 },
  ];
  const RIVALS = [['Hana', '花'], ['Kenji', '健'], ['Yui', '結'], ['Sora', '空'], ['Aiko', '愛'], ['Ren', '蓮'], ['Mika', '美'], ['Taro', '太'], ['Emi', '恵'], ['Kaito', '海'],
    ['Nana', '七'], ['Leo', '獅'], ['Sara', '沙'], ['Omar', '星'], ['Lina', '月'], ['Diego', '光'], ['Mei', '芽'], ['Jun', '純'], ['Priya', '雪'], ['Tom', '虎'], ['Noor', '朝'], ['Ali', '岳']];
  const PROMOTE = 5, DEMOTE = 3, SIZE = 15;
  const weekStart = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const weekKey = (d) => A.dayKey(weekStart(d));
  const weekXp = (start) => { let sum = 0; for (let i = 0; i < 7; i++) sum += S.daily[A.dayKey(start.getTime() + i * 86400000)] || 0; return sum; };

  function standings(tier, start, fraction) {
    const r = rng(hash(`${A.dayKey(start)}|${tier}`));
    const names = RIVALS.slice().sort(() => r() - 0.5).slice(0, SIZE - 1);
    const base = TIERS[tier].base;
    const rivals = names.map(([name, glyph]) => {
      const target = base * (0.25 + r() * 1.5), curve = 0.6 + r() * 0.9;
      return { name, glyph, xp: Math.round(target * Math.pow(Math.max(0, Math.min(1, fraction)), curve)) };
    });
    const me = { name: S.profile.name || 'You', glyph: (S.profile.name || '私').charAt(0), xp: weekXp(start), me: true };
    return [...rivals, me].sort((a, b) => b.xp - a.xp || (a.me ? -1 : 1));
  }
  function leagueState() {
    const key = weekKey();
    if (!S.league) S.league = { tier: 0, week: key, result: null };
    if (S.league.week !== key) {
      // Settle the week that just ended
      const lastStart = new Date(`${S.league.week}T00:00:00`);
      const table = standings(S.league.tier, lastStart, 1);
      const rank = table.findIndex((x) => x.me) + 1;
      const played = table.find((x) => x.me).xp > 0;
      let move = 0;
      if (played && rank <= PROMOTE && S.league.tier < TIERS.length - 1) move = 1;
      else if (rank > SIZE - DEMOTE && S.league.tier > 0) move = -1;
      S.league = { tier: S.league.tier + move, week: key, result: played ? { rank, move, tier: S.league.tier + move } : null };
      A.save();
    }
    return S.league;
  }
  A.league = () => {
    const L = leagueState();
    const start = weekStart();
    const fraction = (Date.now() - start.getTime()) / (7 * 86400000);
    const table = standings(L.tier, start, fraction);
    const rank = table.findIndex((x) => x.me) + 1;
    const daysLeft = 7 - Math.floor(fraction * 7);
    return { L, tier: TIERS[L.tier], tierIndex: L.tier, table, rank, daysLeft, TIERS, PROMOTE, DEMOTE };
  };
  A.leagueCard = () => {
    const g = A.league();
    return `<button class="league-card" data-league style="--t:${g.tier.color}">
      <span class="league-badge" lang="ja">${g.tier.jp}</span>
      <span class="league-text"><b>${g.tier.name} League</b><small>#${g.rank} of ${g.table.length} · ${g.daysLeft} day${g.daysLeft === 1 ? '' : 's'} left</small></span>
      <span class="league-rank ${g.rank <= g.PROMOTE ? 'up' : g.rank > g.table.length - g.DEMOTE ? 'down' : ''}">${g.rank <= g.PROMOTE ? '▲' : g.rank > g.table.length - g.DEMOTE ? '▼' : '•'}</span><span class="chev">›</span></button>`;
  };
  A.leagueSheet = () => {
    const g = A.league();
    const s = A.sheet(`<div class="sheet-body league-sheet" style="--t:${g.tier.color}">
      <div class="league-tiers">${g.TIERS.map((t, i) => `<span class="${i === g.tierIndex ? 'on' : i < g.tierIndex ? 'past' : ''}" style="--c:${t.color}" lang="ja">${t.jp}</span>`).join('')}</div>
      <h2>${g.tier.name} League</h2>
      <p class="muted small">Top ${g.PROMOTE} move up, bottom ${g.DEMOTE} move down · ends in ${g.daysLeft} day${g.daysLeft === 1 ? '' : 's'}. Earn XP to climb!</p>
      <ol class="league-list">${g.table.map((x, i) => `${i === g.PROMOTE ? '<li class="zone up">▲ Promotion zone</li>' : ''}${i === g.table.length - g.DEMOTE ? '<li class="zone down">▼ Demotion zone</li>' : ''}
        <li class="${x.me ? 'me' : ''}"><span class="lr">${i + 1}</span><span class="la" lang="ja">${esc(x.glyph)}</span><span class="ln">${esc(x.name)}${x.me ? ' (you)' : ''}</span><b>${x.xp} XP</b></li>`).join('')}</ol>
      <p class="muted small center">Your rivals are practice partners for now — real friends can join once accounts are added.</p>
      ${navigator.share ? '<button class="btn block" data-share>Invite a friend to Sakura Study</button>' : ''}
      <button class="btn primary block" data-close>Close</button></div>`);
    const sh = A.$('[data-share]', s.el);
    if (sh) sh.addEventListener('click', () => navigator.share({ title: 'Sakura Study', text: 'Learn Japanese with me on Sakura Study! 🌸', url: location.href.replace(/#.*$/, '') }).catch(() => {}));
  };
  // Show last week's result once
  A.leagueNews = () => {
    const L = leagueState();
    if (!L.result || L.result.shown) return;
    L.result.shown = true; A.save();
    const t = TIERS[L.result.tier];
    const msg = L.result.move > 0 ? ['しょうかく！', `Promoted to the ${t.name} League!`] : L.result.move < 0 ? ['ざんねん…', `You finished #${L.result.rank} and moved to the ${t.name} League. You’ll climb back!`] : ['おつかれさま！', `You finished #${L.result.rank} last week. Stay in ${t.name} and push for the top ${PROMOTE}!`];
    const s = A.sheet(`<div class="sheet-body center"><span class="league-badge big" style="--t:${t.color}" lang="ja">${t.jp}</span><h2 lang="ja">${msg[0]}</h2><p>${msg[1]}</p><button class="btn primary block" data-close>Let’s go</button></div>`);
    if (L.result.move > 0) { A.sfx('bell'); A.confetti(); }
    return s;
  };

  // ── Daily reminder ──
  // Home-screen web apps can't schedule notifications on their own, so the reminder is a repeating
  // event with an alarm in the iPhone's Calendar — reliable, and it works even when the app is closed.
  const pad = (n) => String(n).padStart(2, '0');
  function icsFile(time) {
    const [h, m] = time.split(':').map(Number);
    const d = new Date(); d.setHours(h, m, 0, 0);
    if (d < new Date()) d.setDate(d.getDate() + 1);
    const local = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const url = location.href.replace(/#.*$/, '');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sakura Study//Daily reminder//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:sakura-study-daily-${now}@sakura-study`, `DTSTAMP:${now}`, `DTSTART:${local}`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY',
      'SUMMARY:🌸 Sakura Study — keep your lantern lit!', `DESCRIPTION:Time for today’s Japanese practice. Maru is waiting! ${url}`, `URL:${url}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:PT0M', 'DESCRIPTION:Time for Japanese with Maru 🐱', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  A.reminderSettings = () => {
    const r = S.reminder || { time: '19:00', nudge: true };
    const s = A.sheet(`<div class="sheet-body settings center-top"><h2>Daily reminder</h2>
      <p class="muted">Pick a time and add a daily alarm to your iPhone Calendar. It reminds you every day — even when the app is closed.</p>
      <label class="field"><span>Remind me at</span><input type="time" data-time value="${esc(r.time)}"></label>
      <button class="btn primary block lg" data-ics>${A.icon('bell')} Add to Calendar</button>
      <p class="muted small">Your iPhone will ask to add “Sakura Study” to your calendar — tap <b>Add All</b>. To change the time later, delete the old event in Calendar and add a new one.</p>
      <label class="toggle"><span>Maru nudges me in the app</span><input type="checkbox" data-nudge ${r.nudge !== false ? 'checked' : ''}><i></i></label>
      <button class="btn block" data-close>Done</button></div>`, { onClose: () => A.go(A.tab) });
    const save = () => { S.reminder = { time: A.$('[data-time]', s.el).value || '19:00', nudge: A.$('[data-nudge]', s.el).checked }; A.save(); };
    s.el.addEventListener('change', save);
    A.$('[data-ics]', s.el).addEventListener('click', () => {
      save();
      const a = document.createElement('a');
      a.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFile(S.reminder.time))}`;
      a.download = 'sakura-study-reminder.ics';
      document.body.appendChild(a); a.click(); a.remove();
      S.reminder.added = Date.now(); A.save();
      A.sfx('chime'); A.toast('Opening Calendar… tap “Add All”');
    });
  };
  // When the app opens after your reminder time and you haven't studied yet, Maru speaks up
  A.reminderNudge = () => {
    const r = S.reminder;
    if (!r || r.nudge === false || A.streak().today) return;
    const [h, m] = r.time.split(':').map(Number), now = new Date();
    if (now.getHours() * 60 + now.getMinutes() < h * 60 + m || S.nudged === A.dayKey()) return;
    S.nudged = A.dayKey(); A.save();
    setTimeout(() => {
      const st = A.streak();
      const s = A.sheet(`<div class="sheet-body center"><div class="maru-host">${A.mascot('wave big')}</div><h2 lang="ja">べんきょう の じかん！</h2>
        <p>${st.n ? `Your ${st.n}-day lantern is waiting — one quick lesson keeps it lit.` : 'It’s study time! One short lesson is all it takes.'}</p>
        <button class="btn primary block lg" data-close data-start-now>Start a lesson</button><button class="btn ghost block" data-close>Later</button></div>`);
      A.sfx('meow');
      A.$('[data-start-now]', s.el).addEventListener('click', () => { const l = A.currentLesson(); if (l) A.startLesson(l); });
    }, 700);
  };
})(window.A);
