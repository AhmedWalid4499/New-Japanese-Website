// "Add your own" forms for vocabulary, kanji, grammar, adjective pairs and counters.
(function (S) {
  const esc = S.esc;

  const VOCAB_CATS = [['custom', 'Custom'], ['greetings', 'Greetings'], ['numbers', 'Numbers'], ['time', 'Time'], ['food', 'Food'], ['family', 'Family'], ['place', 'Places'], ['adjective', 'Adjectives'], ['verb', 'Verbs'], ['body', 'Body'], ['clothes', 'Clothes'], ['house', 'House'], ['transport', 'Transport'], ['nature', 'Nature'], ['school', 'School'], ['hobbies', 'Hobbies'], ['nouns', 'Other words']];
  const KANJI_CATS = [['other', 'Other'], ['numbers', 'Numbers'], ['nature', 'Nature'], ['people', 'People'], ['time', 'Time'], ['body', 'Body'], ['direction', 'Direction']];
  const COUNTER_CATS = [['general', 'General'], ['time', 'Time'], ['people', 'People'], ['nature', 'Nature'], ['objects', 'Objects'], ['places', 'Places']];

  const field = (label, name, { ph = '', req = false, type = 'text', hint = '', area = 0, opts, value = '', jp = false } = {}) => `
    <label class="field">
      <span class="field-label">${esc(label)}${req ? ' <i class="req">*</i>' : ''}</span>
      ${opts ? `<select name="${name}">${opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select>`
        : area ? `<textarea name="${name}" rows="${area}" placeholder="${esc(ph)}" ${req ? 'required' : ''}></textarea>`
        : `<input name="${name}" type="${type}" placeholder="${esc(ph)}" value="${esc(value)}" ${req ? 'required' : ''} ${jp ? 'lang="ja"' : ''} autocomplete="off">`}
      ${hint ? `<span class="field-hint">${esc(hint)}</span>` : ''}
    </label>`;

  const FORMS = {
    vocab: { title: 'Add a word', html: () =>
      field('Japanese', 'jp', { ph: '猫 or ねこ', req: true, jp: true }) +
      field('Reading', 'read', { ph: 'neko' }) +
      field('Meaning', 'en', { ph: 'cat', req: true }) +
      field('Category', 'cat', { opts: VOCAB_CATS }),
      build: (f) => ({ jp: f.jp, read: f.read, en: f.en, cat: f.cat }) },

    kanji: { title: 'Add a kanji', html: () =>
      field('Kanji', 'char', { ph: '猫', req: true, jp: true }) +
      `<div class="grid-2">${field('On reading', 'on', { ph: 'ビョウ' })}${field('Kun reading', 'kun', { ph: 'ねこ' })}</div>` +
      field('Meaning', 'meaning', { ph: 'cat', req: true }) +
      `<div class="grid-2">${field('Strokes', 'strokes', { type: 'number', value: '5' })}${field('Category', 'cat', { opts: KANJI_CATS })}</div>` +
      field('Example words', 'words', { area: 3, ph: '子猫|こねこ|kitten', hint: 'One per line: japanese|reading|english' }),
      build: (f) => ({
        char: f.char, on: f.on, kun: f.kun, meaning: f.meaning, strokes: parseInt(f.strokes, 10) || 0, cat: f.cat,
        words: f.words.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [jp = '', read = '', en = ''] = l.split('|'); return { jp, read, en }; }),
      }) },

    grammar: { title: 'Add a grammar pattern', html: () =>
      field('Pattern', 'pattern', { ph: '〜てもいいです', req: true, jp: true }) +
      field('Meaning', 'meaning', { ph: 'It’s okay to ~ / may', req: true }) +
      field('Structure', 'structure', { ph: 'Verb て-form + もいいです' }) +
      field('Explanation', 'explanation', { area: 3, ph: 'How is this pattern used?' }) +
      '<div class="form-sep">Example sentence (optional)</div>' +
      field('Japanese', 'exjp', { ph: 'ここに すわっても いいですか。', jp: true }) +
      field('Romaji', 'exrom', { ph: 'Koko ni suwatte mo ii desu ka.' }) +
      field('English', 'exen', { ph: 'May I sit here?' }),
      build: (f) => ({ pattern: f.pattern, meaning: f.meaning, structure: f.structure, explanation: f.explanation, examples: f.exjp ? [{ jp: f.exjp, rom: f.exrom, en: f.exen }] : [] }) },

    adj: { title: 'Add an adjective pair', html: () =>
      '<div class="form-sep">Adjective A</div>' +
      `<div class="grid-3">${field('Japanese', 'ajp', { ph: 'おおきい', req: true, jp: true })}${field('Romaji', 'arom', { ph: 'ookii' })}${field('English', 'aen', { ph: 'big', req: true })}</div>` +
      '<div class="form-sep">Its opposite</div>' +
      `<div class="grid-3">${field('Japanese', 'bjp', { ph: 'ちいさい', req: true, jp: true })}${field('Romaji', 'brom', { ph: 'chiisai' })}${field('English', 'ben', { ph: 'small', req: true })}</div>` +
      field('Type', 'type', { opts: [['i', 'い-adjective'], ['na', 'な-adjective']] }),
      build: (f) => ({ a: { jp: f.ajp, rom: f.arom, en: f.aen }, b: { jp: f.bjp, rom: f.brom, en: f.ben }, type: f.type }) },

    counters: { title: 'Add a counter', html: () =>
      `<div class="grid-2">${field('Title', 'title', { ph: 'Cups / glasses', req: true })}${field('Suffix', 'suffix', { ph: '〜はい (杯)', req: true, jp: true })}</div>` +
      `<div class="grid-2">${field('Emoji', 'emoji', { ph: '☕' })}${field('Category', 'cat', { opts: COUNTER_CATS })}</div>` +
      field('Description', 'desc', { area: 2, ph: 'Used for cups, glasses and bowls of liquid.' }) +
      field('Number forms', 'rows', { area: 4, ph: '1|いっぱい|ippai*|one cup\n2|にはい|nihai|two cups', hint: 'One per line: number|japanese|romaji|english — add * after the romaji to mark it irregular' }) +
      field('Example sentence', 'example', { ph: 'コーヒーを いっぱい のみます。|Koohii o ippai nomimasu.|I drink one cup of coffee.', hint: 'japanese|romaji|english' }),
      build: (f) => ({
        id: `custom_${Date.now()}`, title: f.title, suffix: f.suffix, emoji: f.emoji || '📌', desc: f.desc, cat: f.cat, pics: [], note: '',
        rows: f.rows.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [n = '', jp = '', rom = '', en = ''] = l.split('|'); return { n, jp, rom: rom.replace('*', ''), en, irreg: rom.endsWith('*') }; }),
        examples: f.example ? [(() => { const [jp = '', rom = '', en = ''] = f.example.split('|'); return { jp, rom, en }; })()] : [],
      }) },
  };

  // Opens the form; calls onSaved() after the entry is stored.
  function openForm(type, onSaved) {
    const def = FORMS[type];
    const m = S.modal({
      title: def.title,
      body: `<form class="form" novalidate>${def.html()}
        <p class="muted small">Saved on this device${S.cloud.user ? ' and synced to your account' : ''}.</p>
        <div class="row gap end"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary" type="submit">${S.icon('check')} Save</button></div></form>`,
    });
    const form = S.$('form', m.el);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const missing = S.$$('[required]', form).find((i) => !i.value.trim());
      if (missing) { missing.focus(); missing.classList.add('invalid'); S.toast('Please fill in the required fields.'); return; }
      const f = Object.fromEntries(Array.from(new FormData(form).entries()).map(([k, v]) => [k, String(v).trim()]));
      S.store.custom.add(type, def.build(f));
      m.close();
      S.toast('Saved to your collection');
      onSaved && onSaved();
    });
  }

  function remove(type, idx, onDone) {
    if (!S.confirm('Delete this custom entry?')) return;
    S.store.custom.remove(type, idx);
    S.toast('Entry deleted');
    onDone && onDone();
  }

  S.custom = { openForm, remove, VOCAB_CATS, KANJI_CATS, COUNTER_CATS };
})(window.S);
