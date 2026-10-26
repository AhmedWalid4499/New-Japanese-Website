// The course: units → lessons → items, built from the website's study data
// (assets/js/data/*.js), so content is edited in one place for both.
(function (A) {
  const items = {};               // itemId → item
  const add = (it) => { items[it.id] = it; return it; };
  const clean = (s) => String(s || '').trim();

  // Item kinds: kana (char ↔ romaji), word, kanji, sentence
  const kanaItems = (rows, script) => rows.flatMap((r) => r.cells).filter((c) => c.k && !/[ぢづヂヅ]/.test(c.k))
    .map((c) => add({ id: `${script}:${c.k}`, kind: 'kana', jp: c.k, read: '', en: c.r, say: c.k }));
  const wordItems = (list) => list.map((v) => add({ id: `w:${v.jp}`, kind: 'word', jp: clean(v.jp), read: clean(v.read), en: clean(v.en), say: clean(v.jp) }));
  const vocab = (...cats) => wordItems(VOCAB.filter((v) => cats.includes(v.cat)));
  const kanjiItems = (...cats) => KANJI.filter((k) => cats.includes(k.cat)).map((k) => add({
    id: `k:${k.char}`, kind: 'kanji', jp: k.char, read: (k.kun || k.on).split('・')[0].replace(/[()（）]/g, ''), en: k.meaning, say: (k.kun || k.on).split('・')[0], words: k.words || [],
  }));
  const sentence = (jp, rom, en) => add({ id: `s:${jp}`, kind: 'sentence', jp: clean(jp), read: clean(rom), en: clean(en), say: clean(jp) });
  const grammarSentences = (...ids) => GRAMMAR_SECTIONS.filter((s) => ids.includes(s.id)).flatMap((s) => s.items.flatMap((g) => g.examples.map((e) => sentence(e.jp, e.rom, e.en))));
  const phrases = (...cats) => SURVIVAL_PHRASES.filter((p) => cats.includes(p.cat) && !p.jp.includes('___') && !p.jp.includes('／')).map((p) => sentence(p.jp, p.rom, p.en));
  const adjItems = () => wordItems(ADJ_PAIRS.flatMap((p) => [{ jp: p.a.jp, read: p.a.rom, en: p.a.en }, { jp: p.b.jp, read: p.b.rom, en: p.b.en }]).filter((v, i, a) => a.findIndex((x) => x.jp === v.jp) === i));
  const grammarGuide = (...ids) => GRAMMAR_SECTIONS.filter((s) => ids.includes(s.id)).flatMap((s) => s.items).map((g) => ({ h: g.pattern, p: `${g.meaning}. ${g.explanation}`, ex: g.examples[0] }));
  const fills = (...cats) => SP_QUESTIONS.filter((q) => cats.includes(q.cat));

  // color, dark = the 3D edge shade
  const UNITS = [
    { id: 'hira1', title: 'Hiragana basics', jp: 'ひらがな', color: '#d9577c', dark: '#b03f60', size: 5, items: kanaItems(HIRAGANA_ROWS.slice(0, 11), 'h'),
      guide: [{ h: 'What is hiragana?', p: 'Hiragana is the core Japanese alphabet: 46 sounds used for native words and grammar endings. Every sound is a consonant + vowel (ka, ki, ku…) or a vowel on its own.' }, { h: 'The five vowels', p: 'a (あ) as in “father”, i (い) as in “see”, u (う) as in “food”, e (え) as in “bed”, o (お) as in “go”.' }, { h: 'Tip', p: 'Learn one row a day. Say each sound out loud as you tap it.' }] },
    { id: 'greet', title: 'Greetings', jp: 'あいさつ', color: '#6b8f3a', dark: '#53712c', size: 5, items: [...vocab('greetings'), ...phrases('greetings')],
      guide: [{ h: 'Politeness matters', p: 'ございます makes a greeting more polite: おはよう (casual) → おはようございます (polite).' }, { h: 'すみません', p: 'One of the most useful words: “excuse me”, “sorry”, and even “thank you” for small favours.' }] },
    { id: 'hira2', title: 'Hiragana: voiced & combos', jp: 'がぎぐ', color: '#b2547a', dark: '#8e3f60', size: 5, items: kanaItems(HIRAGANA_ROWS.slice(11), 'h'),
      guide: [{ h: 'Dakuten ゛', p: 'Two small marks make a sound “voiced”: か ka → が ga, さ sa → ざ za, た ta → だ da, は ha → ば ba.' }, { h: 'Handakuten ゜', p: 'A small circle turns は-row into p sounds: は ha → ぱ pa.' }, { h: 'Combinations', p: 'A small ゃ ゅ ょ blends with the sound before: き + ゃ = きゃ kya.' }] },
    { id: 'kata', title: 'Katakana', jp: 'カタカナ', color: '#3b5a8c', dark: '#2c446b', size: 5, items: kanaItems(KATAKANA_ROWS, 'k'),
      guide: [{ h: 'What is katakana?', p: 'The second alphabet. Same sounds as hiragana, used for foreign loanwords: コーヒー (coffee), テレビ (TV).' }, { h: 'Long vowels', p: 'The dash ー makes a vowel long: ケーキ keeki (cake).' }] },
    { id: 'num', title: 'Numbers', jp: 'すうじ', color: '#cf6a32', dark: '#a85224', size: 6, items: vocab('numbers'),
      guide: [{ h: 'Counting', p: '1–10: いち、に、さん、よん、ご、ろく、なな、はち、きゅう、じゅう. 11 is じゅういち (10+1), 20 is にじゅう (2×10).' }, { h: 'Sound changes', p: '300 さんびゃく, 600 ろっぴゃく, 800 はっぴゃく, 3000 さんぜん.' }] },
    { id: 'basic', title: 'First sentences', jp: 'ぶん', color: '#8366ad', dark: '#664e8a', size: 4, items: grammarSentences('sentences', 'particles'), fills: fills('particles'), guide: grammarGuide('sentences', 'particles') },
    { id: 'time', title: 'Time & days', jp: 'じかん', color: '#3e8a80', dark: '#2e6b63', size: 6, items: vocab('time'),
      guide: [{ h: 'Days of the week', p: 'Each day is named after an element: 月 moon (Monday), 火 fire, 水 water, 木 wood, 金 gold, 土 earth, 日 sun.' }] },
    { id: 'family', title: 'Family & people', jp: 'かぞく', color: '#c4473a', dark: '#9c372c', size: 6, items: vocab('family'),
      guide: [{ h: 'My family vs yours', p: 'Japanese uses humble words for your own family (はは, my mother) and polite words for others’ (おかあさん, your mother).' }] },
    { id: 'food', title: 'Food & drink', jp: 'たべもの', color: '#c9922a', dark: '#a0731d', size: 6, items: vocab('food'),
      guide: [{ h: 'At the table', p: 'Say いただきます before eating and ごちそうさまでした after.' }] },
    { id: 'kanji1', title: 'Kanji: numbers & time', jp: '漢字', color: '#2f4f6f', dark: '#223a52', size: 5, items: kanjiItems('numbers', 'time'),
      guide: [{ h: 'What are kanji?', p: 'Characters borrowed from Chinese. Each has a meaning and usually two kinds of reading: on’yomi (Chinese-style) and kun’yomi (Japanese).' }, { h: 'Tip', p: 'Learn kanji inside words: 一月 (January), 三時 (3 o’clock).' }] },
    { id: 'places', title: 'Places & transport', jp: 'ばしょ', color: '#3b5a8c', dark: '#2c446b', size: 6, items: vocab('place', 'transport'),
      guide: [{ h: 'Going places', p: 'Use へ or に for destinations: がっこう へ いきます (I go to school). Use で for transport: でんしゃ で (by train).' }] },
    { id: 'verbs', title: 'Verbs', jp: 'どうし', color: '#6b8f3a', dark: '#53712c', size: 5, items: [...vocab('verb'), ...grammarSentences('verbs')], fills: fills('te-form', 'conjugation'), guide: grammarGuide('verbs').slice(0, 10) },
    { id: 'adj', title: 'Adjectives', jp: 'けいようし', color: '#b2547a', dark: '#8e3f60', size: 6, items: [...adjItems(), ...grammarSentences('adjectives')], guide: grammarGuide('adjectives') },
    { id: 'kanji2', title: 'Kanji: nature & people', jp: '山川人', color: '#3e8a80', dark: '#2e6b63', size: 5, items: kanjiItems('nature', 'people', 'body'),
      guide: [{ h: 'Pictures that became characters', p: '山 looks like a mountain, 川 like a flowing river, 人 like a walking person.' }] },
    { id: 'home', title: 'Body, clothes & home', jp: 'からだ', color: '#cf6a32', dark: '#a85224', size: 6, items: vocab('body', 'clothes', 'house'),
      guide: [{ h: 'Wearing things', p: 'Japanese uses different verbs: きます for tops, はきます for shoes and trousers, かぶります for hats.' }] },
    { id: 'kanji3', title: 'Kanji: directions & more', jp: '上下', color: '#8366ad', dark: '#664e8a', size: 5, items: kanjiItems('direction', 'other'),
      guide: [{ h: 'Directions', p: '上 up, 下 down, 右 right, 左 left, 中 inside, 外 outside, 前 front, 後 behind.' }] },
    { id: 'life', title: 'School, hobbies & nature', jp: 'せいかつ', color: '#2f4f6f', dark: '#223a52', size: 6, items: vocab('school', 'hobbies', 'nature'),
      guide: [{ h: 'Talking about likes', p: 'Xがすきです: I like X. Xがじょうずです: I’m good at X.' }] },
    { id: 'travel', title: 'Survival Japanese', jp: 'たびの かいわ', color: '#c4473a', dark: '#9c372c', size: 4, items: phrases('shopping', 'restaurant', 'directions', 'transport', 'hotel', 'emergency'),
      guide: [{ h: 'Magic words', p: '〜をください (please give me ~), 〜はどこですか (where is ~?), いくらですか (how much?).' }] },
    { id: 'words', title: 'Everyday words', jp: 'ことば', color: '#c9922a', dark: '#a0731d', size: 6, items: vocab('nouns', 'adjective'),
      guide: [{ h: 'Frequency words', p: 'いつも always, よく often, ときどき sometimes, あまり〜ない not much, ぜんぜん〜ない not at all.' }] },
    { id: 'expr', title: 'Expressions & patterns', jp: 'ひょうげん', color: '#6b8f3a', dark: '#53712c', size: 4, items: grammarSentences('tense', 'expressions'), fills: fills('patterns'), guide: grammarGuide('tense', 'expressions') },
  ];

  UNITS.forEach((u, ui) => {
    u.index = ui;
    u.items.forEach((it) => { it.unit = u.id; });
    u.lessons = A.chunk(u.items, u.size).map((chunk, li) => ({ unit: u, index: li, key: `${u.id}:${li}`, items: chunk }));
  });

  A.UNITS = UNITS;
  A.items = items;
  A.allLessons = UNITS.flatMap((u) => u.lessons);
  A.lessonDone = (l) => (A.state.lessons[l.key]?.done || 0) > 0;
  // The first lesson not yet completed is the "current" one; everything after it is locked
  A.currentLesson = () => A.allLessons.find((l) => !A.lessonDone(l)) || null;
  A.isUnlocked = (l) => { const cur = A.currentLesson(); return !cur || A.allLessons.indexOf(l) <= A.allLessons.indexOf(cur); };
  A.unitProgress = (u) => u.lessons.filter(A.lessonDone).length;
})(window.A);
