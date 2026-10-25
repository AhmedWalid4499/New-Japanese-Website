// Quizzes hub — kana, kanji, vocabulary and numbers, all on the shared quiz engine.
(function (S) {
  const esc = S.esc;
  // ぢ/づ share romaji with じ/ず, so they're left out to keep every question unambiguous
  const kanaPool = (script) => [
    ...(script !== 'katakana' ? HIRAGANA_ROWS : []),
    ...(script !== 'hiragana' ? KATAKANA_ROWS : []),
  ].flatMap((r) => r.cells).filter((c) => c.k && !/[ぢづヂヅ]/.test(c.k));
  const kanjiReading = (k) => (k.kun || k.on.split('・')[0]);

  const QUIZZES = {
    kana: {
      title: 'Kana quiz', glyph: 'あ', desc: 'Read hiragana and katakana at speed.',
      fields: [
        ['script', 'Script', [['hiragana', 'Hiragana'], ['katakana', 'Katakana'], ['both', 'Both']]],
        ['dir', 'Direction', [['read', 'Kana → romaji'], ['write', 'Romaji → kana']]],
        ['n', 'Questions', [['20', '20'], ['10', '10'], ['40', '40']]],
        ['timer', 'Timer', [['15', '15 s per question'], ['0', 'Untimed']]],
      ],
      make: (o) => {
        const pool = kanaPool(o.script);
        return o.dir === 'write'
          ? S.quiz.build(pool, +o.n, { prompt: (c) => c.r, answer: (c) => c.k, sub: () => 'Pick the matching kana' })
          : S.quiz.build(pool, +o.n, { prompt: (c) => c.k, answer: (c) => c.r, big: true });
      },
      score: 'Kana Quiz',
    },
    kanji: {
      title: 'Kanji quiz', glyph: '漢', desc: 'Readings, meanings, or find the kanji.',
      fields: [
        ['mode', 'Question type', [['meaning', 'Kanji → meaning'], ['reading', 'Kanji → reading'], ['reverse', 'Meaning → kanji']]],
        ['n', 'Questions', [['20', '20'], ['10', '10'], ['40', '40']]],
        ['timer', 'Timer', [['30', '30 s per question'], ['0', 'Untimed']]],
      ],
      make: (o) => {
        if (o.mode === 'reading') return S.quiz.build(KANJI, +o.n, { prompt: (k) => k.char, answer: kanjiReading, big: true, sub: () => 'How is it read?' });
        if (o.mode === 'reverse') return S.quiz.build(KANJI, +o.n, { prompt: (k) => k.meaning, answer: (k) => k.char, sub: () => 'Which kanji means this?' });
        return S.quiz.build(KANJI, +o.n, { prompt: (k) => k.char, answer: (k) => k.meaning, big: true, sub: () => 'What does it mean?' });
      },
      score: 'Kanji Quiz',
    },
    vocab: {
      title: 'Vocabulary quiz', glyph: '語', desc: 'Words from any topic, both directions.',
      fields: [
        ['dir', 'Direction', [['jp', 'Japanese → English'], ['en', 'English → Japanese']]],
        ['cat', 'Topic', [['all', 'All topics'], ...S.uniq(VOCAB.map((v) => v.cat)).map((c) => [c, S.vocabLabel(c)])]],
        ['n', 'Questions', [['20', '20'], ['10', '10'], ['40', '40']]],
        ['timer', 'Timer', [['0', 'Untimed'], ['20', '20 s per question']]],
      ],
      make: (o) => {
        const pool = VOCAB.filter((v) => o.cat === 'all' || v.cat === o.cat);
        const distractorPool = pool.length >= 8 ? pool : VOCAB;
        return o.dir === 'en'
          ? S.quiz.build(pool, +o.n, { prompt: (v) => v.en, answer: (v) => v.jp, distractorPool, tag: (v) => S.vocabLabel(v.cat) })
          : S.quiz.build(pool, +o.n, { prompt: (v) => v.jp, answer: (v) => v.en, sub: (v) => v.read, big: (v) => v.jp.length <= 6, distractorPool, tag: (v) => S.vocabLabel(v.cat) });
      },
      score: 'Vocab Quiz',
    },
    numbers: {
      title: 'Numbers quiz', glyph: '数', desc: 'Prices, times and dates.',
      fields: [['timer', 'Timer', [['0', 'Untimed'], ['20', '20 s per question']]]],
      make: () => NUM_QUIZ_Q.map((q) => ({ prompt: q.q, options: q.opts, answer: q.ans })),
      score: 'Numbers Quiz',
    },
  };

  function hub(root, preselect) {
    root.innerHTML = `
      ${S.ui.pageHead({ kicker: 'Practice', title: 'Quizzes', jp: 'クイズ', desc: 'Quick multiple-choice rounds. Use the number keys <kbd>1</kbd>–<kbd>4</kbd> to answer and <kbd>Enter</kbd> to continue.' })}
      <div class="quiz-grid">${Object.entries(QUIZZES).map(([key, z]) => `
        <form class="card quiz-setup ${key === preselect ? 'focus' : ''}" data-quiz="${key}">
          <div class="quiz-setup-head"><span class="glyph big" lang="ja">${z.glyph}</span><div><h2>${esc(z.title)}</h2><p class="muted">${esc(z.desc)}</p></div></div>
          ${z.fields.map(([name, label, opts]) => `<label class="field inline"><span class="field-label">${esc(label)}</span>
            <select name="${name}">${opts.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select></label>`).join('')}
          <button class="btn primary block" type="submit">${S.icon('play')} Start</button>
        </form>`).join('')}</div>
      <section class="card tip row gap"><span class="glyph big" lang="ja">試</span><div><h2 class="card-title">Ready for the real thing?</h2><p class="muted">The mock exam mixes grammar, kanji and vocabulary under a 35-minute timer.</p></div><span class="spacer"></span><button class="btn" data-go="exam">Open mock exam ${S.icon('arrow')}</button></section>`;

    S.$$('form[data-quiz]', root).forEach((f) => f.addEventListener('submit', (e) => {
      e.preventDefault();
      const key = f.dataset.quiz;
      const z = QUIZZES[key];
      const o = Object.fromEntries(new FormData(f).entries());
      const stage = document.createElement('div');
      stage.className = 'quiz-stage';
      root.replaceChildren(stage);
      window.scrollTo(0, 0);
      S.quiz.run(stage, {
        title: z.title, scoreType: z.score, questions: z.make(o), makeQuestions: () => z.make(o),
        timePerQ: +(o.timer || 0), onExit: () => hub(root, key),
      });
    }));
    if (preselect) { const f = S.$(`[data-quiz="${preselect}"]`, root); f && f.scrollIntoView({ block: 'center' }); }
  }

  S.view('quiz', { render(root, { query }) { hub(root, query.type); } });
})(window.S);
