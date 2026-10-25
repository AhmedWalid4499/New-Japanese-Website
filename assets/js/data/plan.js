// 8-week study plan, external resources and study tips.
// Plain data — edit freely. Loaded as a classic script, so these consts are global.

const STUDY_PLAN=[
  {week:'Week 1–2',title:'Foundation: Kana & Basic Sentences',color:'#ff85a1',emoji:'🌱',tasks:['Master hiragana (46 characters) — 1 row per day','Master katakana (46 characters) — 1 row per day','Learn basic sentence structure: は〜です, は〜じゃないです','Practice particles: は, が, を, に, で, へ','Study Numbers 1–100, days of the week, telling time']},
  {week:'Week 3',title:'Verbs Group 1, 2 & 3',color:'#4cc9f0',emoji:'⚡',tasks:['Understand the difference between Group 1, 2, and 3 verbs','Memorize the two irregular verbs: する and くる','Practice masu-form (polite) conjugation','Learn past tense: 〜ました and 〜ませんでした','Practice 20 common verbs with their group classification']},
  {week:'Week 4',title:'い and な Adjectives',color:'#f77f00',emoji:'🎨',tasks:['Learn all い-adjective conjugation forms (negative, past, past negative)','Learn all な-adjective conjugation forms','Study adjective + noun patterns (の vs な placement)','Memorize adjective opposites pairs (at least 15 pairs)','Practice sentences using both adjective types']},
  {week:'Week 5',title:'Grammar Patterns & Expressions',color:'#c77dff',emoji:'💬',tasks:['Study te-form for all 3 verb groups','Practice 〜ています (ongoing action), 〜てください (request)','Learn 〜たい (want to), 〜ことができます (can do)','Study reason patterns: 〜から, 〜ので','Practice expression patterns: 〜と おもいます, 〜に なります']},
  {week:'Week 6',title:'Kanji: First 40',color:'#06d6a0',emoji:'漢',tasks:['Study numbers kanji: 一二三四五六七八九十百千万円','Study time kanji: 日月年時分半今週','Study nature kanji: 火水木金土山川花雨空','Study people kanji: 人女男子父母友先生','Write each kanji 5 times and create example sentences']},
  {week:'Week 7',title:'Kanji: Remaining 40 + Vocab Review',color:'#ffb347',emoji:'📖',tasks:['Study direction kanji: 右左上下中外前後間','Study body kanji: 口目耳手足気','Study common kanji: 大小高長国学校語本字何車駅','Study action kanji: 白赤青電話食飲見聞読書来行','Review all 80 kanji using flashcards and spaced repetition']},
  {week:'Week 8',title:'Mock Exams & Weak Points',color:'#e05f88',emoji:'📋',tasks:['Take at least 3 full mock exams (use this site!)','Review every wrong answer and understand why','Focus extra study time on your weakest section (Grammar/Kanji/Vocab)','Practice reading comprehension with N5 texts','Do timed kanji quizzes daily — aim for 80%+ accuracy']},
  {week:'Exam Week',title:'Final Review & Confidence!',color:'#7b2d8b',emoji:'🌸',tasks:['Light review only — don\'t cram new material!','Go through your personal weak points once more','Get a good night\'s sleep the night before','Eat a good breakfast on exam day','You\'ve got this! 頑張れ！ 🌸']},
];

const RESOURCES=[
  {name:'JLPT Sensei',desc:'Comprehensive N5 study materials, grammar, vocabulary lists, and practice tests.',url:'https://jlptsensei.com',icon:'🎓',tag:'Grammar & Vocab'},
  {name:'WaniKani',desc:'Mnemonics-based kanji and vocab learning with spaced repetition system.',url:'https://wanikani.com',icon:'🦀',tag:'Kanji SRS'},
  {name:'Tae Kim\'s Grammar Guide',desc:'Free, comprehensive Japanese grammar guide from beginner to advanced.',url:'https://guidetojapanese.org',icon:'📗',tag:'Grammar'},
  {name:'Anki',desc:'Best free flashcard app with SRS. Download free N5 decks from AnkiWeb.',url:'https://apps.ankiweb.net',icon:'🃏',tag:'Flashcards'},
  {name:'NHK Web Easy',desc:'Real Japanese news in simplified Japanese. Great reading practice for N4-N5.',url:'https://www3.nhk.or.jp/news/easy',icon:'📰',tag:'Reading'},
  {name:'JapanesePod101',desc:'Audio and video lessons for all levels, including full N5 focused content.',url:'https://japanesepod101.com',icon:'🎧',tag:'Listening'},
  {name:'Jisho.org',desc:'Best free Japanese-English dictionary with stroke order, JLPT tags, and example sentences.',url:'https://jisho.org',icon:'📖',tag:'Dictionary'},
  {name:'Duolingo Japanese',desc:'Free gamified learning — great for building daily habits and basic vocab.',url:'https://duolingo.com',icon:'🦜',tag:'General'},
  {name:'Bunpro',desc:'SRS-based grammar. Has an N5 grammar path with JLPT-style sentences.',url:'https://bunpro.jp',icon:'🌿',tag:'Grammar SRS'},
  {name:'Real Kana',desc:'Free hiragana and katakana practice quiz. Master both kana alphabets fast!',url:'https://realkana.com',icon:'あ',tag:'Kana'},
  {name:'JLPT Bootcamp',desc:'Free N5-specific quizzes covering all sections: grammar, vocab, kanji, reading.',url:'https://jlptbootcamp.com',icon:'🥾',tag:'Practice Tests'},
  {name:'Clozemaster',desc:'Vocabulary in context with fill-in-the-blank sentences. Has N5 mode.',url:'https://clozemaster.com',icon:'🔡',tag:'Vocab in Context'},
];

const MASCOT_TIPS = [
  "💡 Tip: Practice hiragana every morning for just 5 minutes!",
  "🌸 Remember: いい (good) is irregular! Negative = よくない, not いくない!",
  "⚡ Group 3 only has 2 verbs: する and くる. Easy to remember!",
  "漢字 Try to write each kanji 5 times while saying its meaning out loud!",
  "🔵 Particles are everything! は, が, を, に, で — master these first!",
  "🎯 For JLPT N5 you need 80/180 points (plus section minimums) to pass. You've got this!",
  "📖 Reading tip: Guess meaning from context, even if you don't know every word!",
  "🃏 Flashcards work best with spaced repetition — review right before you forget!",
  "✨ な-adjectives need な before nouns: しずかなへや (quiet room)!",
  "⏰ 〜ています can mean ongoing action OR a resultant state. Context matters!",
  "🌺 To say 'I want to do X': take the ます stem and add たい！ e.g. たべたい！",
  "💪 Study a little every day rather than a lot once a week. 継続は力なり！",
  "🎨 い-adjectives ending: negative → くない, past → かった. Easy pattern!",
  "📝 Memorize verb groups by their ending sound — RU verbs are usually Group 2!",
  "🌸 You're doing amazing! がんばれ！Keep going! 応援してるよ！",
  "🔄 Opposite adjectives help double your vocab — learn pairs, not singles!",
  "🎵 Try humming Japanese words to a tune — music helps memory!",
  "☕ Take breaks! Study 25 min → 5 min break (Pomodoro technique) works great!",
];
