// Graded reading stories with tap-to-translate words. Plain data — edit freely.
// Each token is [surface, romaji, english gloss]; punctuation tokens are a single element.
// level: 1 = very easy (first weeks), 2 = easy, 3 = full N5.
const STORIES = [
  // ───────────── Level 1 ─────────────
  {
    id: 'morning',
    title: 'My morning',
    jp: 'わたしの あさ',
    level: 1,
    topic: 'Daily life',
    lines: [
      {
        t: [['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['まいあさ', 'maiasa', 'every morning'], ['しちじ', 'shichi-ji', '7 o’clock'], ['に', 'ni', 'at'], ['おきます', 'okimasu', 'wake up'], ['。']],
        en: 'I wake up at 7 every morning.',
      },
      {
        t: [['あさごはん', 'asagohan', 'breakfast'], ['を', 'o', '(object)'], ['たべます', 'tabemasu', 'eat'], ['。']],
        en: 'I eat breakfast.',
      },
      {
        t: [['パン', 'pan', 'bread'], ['と', 'to', 'and'], ['たまご', 'tamago', 'egg(s)'], ['を', 'o', '(object)'], ['たべます', 'tabemasu', 'eat'], ['。']],
        en: 'I eat bread and eggs.',
      },
      {
        t: [['コーヒー', 'koohii', 'coffee'], ['を', 'o', '(object)'], ['のみます', 'nomimasu', 'drink'], ['。']],
        en: 'I drink coffee.',
      },
      {
        t: [['それから', 'sorekara', 'after that'], ['、'], ['は', 'ha', 'teeth'], ['を', 'o', '(object)'], ['みがきます', 'migakimasu', 'brush'], ['。']],
        en: 'After that, I brush my teeth.',
      },
      {
        t: [['しちじはん', 'shichi-ji han', '7:30'], ['に', 'ni', 'at'], ['うち', 'uchi', 'home'], ['を', 'o', '(from)'], ['でます', 'demasu', 'leave'], ['。']],
        en: 'I leave home at 7:30.',
      },
      {
        t: [['でんしゃ', 'densha', 'train'], ['で', 'de', 'by'], ['かいしゃ', 'kaisha', 'company / office'], ['へ', 'e', 'to'], ['いきます', 'ikimasu', 'go'], ['。']],
        en: 'I go to the office by train.',
      },
      {
        t: [['しごと', 'shigoto', 'work'], ['は', 'wa', '(topic)'], ['くじ', 'ku-ji', '9 o’clock'], ['から', 'kara', 'from'], ['です', 'desu', 'is'], ['。']],
        en: 'Work starts at 9.',
      },
    ],
    questions: [
      { q: 'What time does the writer wake up?', opts: ['6:00', '7:00', '7:30', '9:00'], ans: 1 },
      { q: 'What does the writer eat for breakfast?', opts: ['Rice and fish', 'Bread and eggs', 'Only fruit', 'Nothing'], ans: 1 },
      { q: 'How does the writer get to the office?', opts: ['By bus', 'By bicycle', 'On foot', 'By train'], ans: 3 },
    ],
  },
  {
    id: 'my-family',
    title: 'My family',
    jp: 'わたしの かぞく',
    level: 1,
    topic: 'Family',
    lines: [
      {
        t: [['わたし', 'watashi', 'I'], ['の', 'no', '’s / my'], ['かぞく', 'kazoku', 'family'], ['は', 'wa', '(topic)'], ['よにん', 'yonin', 'four people'], ['です', 'desu', 'is'], ['。']],
        en: 'There are four people in my family.',
      },
      {
        t: [['ちち', 'chichi', '(my) father'], ['と', 'to', 'and'], ['はは', 'haha', '(my) mother'], ['と', 'to', 'and'], ['あに', 'ani', '(my) older brother'], ['が', 'ga', '(subject)'], ['います', 'imasu', 'there is / I have'], ['。']],
        en: 'I have a father, a mother and an older brother.',
      },
      {
        t: [['ちち', 'chichi', '(my) father'], ['は', 'wa', '(topic)'], ['かいしゃいん', 'kaishain', 'office worker'], ['です', 'desu', 'is'], ['。']],
        en: 'My father is an office worker.',
      },
      {
        t: [['はは', 'haha', '(my) mother'], ['は', 'wa', '(topic)'], ['せんせい', 'sensei', 'teacher'], ['です', 'desu', 'is'], ['。']],
        en: 'My mother is a teacher.',
      },
      {
        t: [['あに', 'ani', '(my) older brother'], ['は', 'wa', '(topic)'], ['だいがくせい', 'daigakusei', 'university student'], ['です', 'desu', 'is'], ['。']],
        en: 'My older brother is a university student.',
      },
      {
        t: [['あに', 'ani', '(my) older brother'], ['は', 'wa', '(topic)'], ['せ', 'se', 'height'], ['が', 'ga', '(subject)'], ['たかい', 'takai', 'tall'], ['です', 'desu', 'is'], ['。']],
        en: 'My older brother is tall.',
      },
      {
        t: [['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['がくせい', 'gakusei', 'student'], ['です', 'desu', 'am'], ['。']],
        en: 'I am a student.',
      },
      {
        t: [['うち', 'uchi', 'home'], ['に', 'ni', 'at'], ['は', 'wa', '(topic)'], ['いぬ', 'inu', 'dog'], ['も', 'mo', 'also'], ['います', 'imasu', 'there is'], ['。']],
        en: 'We also have a dog at home.',
      },
      {
        t: [['いぬ', 'inu', 'dog'], ['の', 'no', '’s'], ['なまえ', 'namae', 'name'], ['は', 'wa', '(topic)'], ['ポチ', 'Pochi', 'Pochi'], ['です', 'desu', 'is'], ['。']],
        en: 'The dog’s name is Pochi.',
      },
    ],
    questions: [
      { q: 'How many people are in the writer’s family?', opts: ['Three', 'Four', 'Five', 'Six'], ans: 1 },
      { q: 'What is the mother’s job?', opts: ['Office worker', 'Doctor', 'Teacher', 'Student'], ans: 2 },
      { q: 'Who is tall?', opts: ['The older brother', 'The father', 'The mother', 'The writer'], ans: 0 },
    ],
  },
  {
    id: 'my-room',
    title: 'My room',
    jp: 'わたしの へや',
    level: 1,
    topic: 'Home',
    lines: [
      {
        t: [['これ', 'kore', 'this'], ['は', 'wa', '(topic)'], ['わたし', 'watashi', 'I'], ['の', 'no', '’s / my'], ['へや', 'heya', 'room'], ['です', 'desu', 'is'], ['。']],
        en: 'This is my room.',
      },
      {
        t: [['へや', 'heya', 'room'], ['は', 'wa', '(topic)'], ['あまり', 'amari', '(not) very'], ['ひろくないです', 'hirokunai desu', 'is not spacious'], ['。']],
        en: 'The room is not very big.',
      },
      {
        t: [['まど', 'mado', 'window'], ['の', 'no', 'of'], ['ちかく', 'chikaku', 'near'], ['に', 'ni', 'at'], ['つくえ', 'tsukue', 'desk'], ['が', 'ga', '(subject)'], ['あります', 'arimasu', 'there is'], ['。']],
        en: 'There is a desk near the window.',
      },
      {
        t: [['つくえ', 'tsukue', 'desk'], ['の', 'no', 'of'], ['うえ', 'ue', 'top / on'], ['に', 'ni', 'at'], ['ほん', 'hon', 'book(s)'], ['と', 'to', 'and'], ['ペン', 'pen', 'pen'], ['が', 'ga', '(subject)'], ['あります', 'arimasu', 'there is / are'], ['。']],
        en: 'There are books and a pen on the desk.',
      },
      {
        t: [['ベッド', 'beddo', 'bed'], ['は', 'wa', '(topic)'], ['へや', 'heya', 'room'], ['の', 'no', 'of'], ['みぎ', 'migi', 'right side'], ['に', 'ni', 'at'], ['あります', 'arimasu', 'is (located)'], ['。']],
        en: 'The bed is on the right side of the room.',
      },
      {
        t: [['ドア', 'doa', 'door'], ['の', 'no', 'of'], ['よこ', 'yoko', 'side / next to'], ['に', 'ni', 'at'], ['ほんだな', 'hondana', 'bookshelf'], ['が', 'ga', '(subject)'], ['あります', 'arimasu', 'there is'], ['。']],
        en: 'There is a bookshelf next to the door.',
      },
      {
        t: [['へや', 'heya', 'room'], ['に', 'ni', 'in'], ['テレビ', 'terebi', 'TV'], ['は', 'wa', '(contrast)'], ['ありません', 'arimasen', 'there is not'], ['。']],
        en: 'There is no TV in the room.',
      },
      {
        t: [['でも', 'demo', 'but'], ['、'], ['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['この', 'kono', 'this'], ['へや', 'heya', 'room'], ['が', 'ga', '(object of liking)'], ['すき', 'suki', 'like'], ['です', 'desu', 'is'], ['。']],
        en: 'But I like this room.',
      },
    ],
    questions: [
      { q: 'Where is the desk?', opts: ['Next to the door', 'Near the window', 'On the left side', 'In the kitchen'], ans: 1 },
      { q: 'What is on the right side of the room?', opts: ['A bookshelf', 'A TV', 'A desk', 'The bed'], ans: 3 },
      { q: 'What is NOT in the room?', opts: ['A TV', 'A pen', 'A bookshelf', 'A bed'], ans: 0 },
    ],
  },
  {
    id: 'my-cat',
    title: 'My cat',
    jp: 'わたしの ねこ',
    level: 1,
    topic: 'Animals',
    lines: [
      {
        t: [['うち', 'uchi', 'home'], ['に', 'ni', 'at'], ['ねこ', 'neko', 'cat'], ['が', 'ga', '(subject)'], ['います', 'imasu', 'there is'], ['。']],
        en: 'There is a cat at my house.',
      },
      {
        t: [['なまえ', 'namae', 'name'], ['は', 'wa', '(topic)'], ['タマ', 'Tama', 'Tama'], ['です', 'desu', 'is'], ['。']],
        en: 'Its name is Tama.',
      },
      {
        t: [['タマ', 'Tama', 'Tama'], ['は', 'wa', '(topic)'], ['しろい', 'shiroi', 'white'], ['ねこ', 'neko', 'cat'], ['です', 'desu', 'is'], ['。']],
        en: 'Tama is a white cat.',
      },
      {
        t: [['タマ', 'Tama', 'Tama'], ['は', 'wa', '(topic)'], ['さかな', 'sakana', 'fish'], ['が', 'ga', '(object of liking)'], ['すき', 'suki', 'like'], ['です', 'desu', 'is'], ['。']],
        en: 'Tama likes fish.',
      },
      {
        t: [['ひる', 'hiru', 'daytime'], ['は', 'wa', '(topic)'], ['いつも', 'itsumo', 'always'], ['ねます', 'nemasu', 'sleeps'], ['。']],
        en: 'In the daytime, she always sleeps.',
      },
      {
        t: [['よる', 'yoru', 'night'], ['は', 'wa', '(topic)'], ['げんき', 'genki', 'lively / energetic'], ['です', 'desu', 'is'], ['。']],
        en: 'At night, she is full of energy.',
      },
      {
        t: [['タマ', 'Tama', 'Tama'], ['は', 'wa', '(topic)'], ['ちいさい', 'chiisai', 'small'], ['です', 'desu', 'is'], ['が', 'ga', 'but'], ['、'], ['とても', 'totemo', 'very'], ['つよい', 'tsuyoi', 'strong'], ['です', 'desu', 'is'], ['。']],
        en: 'Tama is small, but she is very strong.',
      },
      {
        t: [['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['タマ', 'Tama', 'Tama'], ['が', 'ga', '(object of liking)'], ['だいすき', 'daisuki', 'love'], ['です', 'desu', 'is'], ['。']],
        en: 'I love Tama.',
      },
    ],
    questions: [
      { q: 'What color is Tama?', opts: ['Black', 'Brown', 'White', 'Gray'], ans: 2 },
      { q: 'What does Tama like?', opts: ['Fish', 'Meat', 'Milk', 'Eggs'], ans: 0 },
      { q: 'When does Tama sleep?', opts: ['At night', 'In the daytime', 'Only in the morning', 'She never sleeps'], ans: 1 },
    ],
  },

  // ───────────── Level 2 ─────────────
  {
    id: 'weekend',
    title: 'My weekend',
    jp: 'しゅうまつ',
    level: 2,
    topic: 'Free time',
    lines: [
      {
        t: [['どようび', 'doyoubi', 'Saturday'], ['に', 'ni', 'on'], ['ともだち', 'tomodachi', 'friend'], ['と', 'to', 'with'], ['こうえん', 'kouen', 'park'], ['へ', 'e', 'to'], ['いきました', 'ikimashita', 'went'], ['。']],
        en: 'On Saturday I went to the park with a friend.',
      },
      {
        t: [['てんき', 'tenki', 'weather'], ['が', 'ga', '(subject)'], ['よかったです', 'yokatta desu', 'was good'], ['。']],
        en: 'The weather was good.',
      },
      {
        t: [['こうえん', 'kouen', 'park'], ['で', 'de', 'at'], ['おべんとう', 'obentou', 'boxed lunch'], ['を', 'o', '(object)'], ['たべました', 'tabemashita', 'ate'], ['。']],
        en: 'We ate boxed lunches in the park.',
      },
      {
        t: [['それから', 'sorekara', 'after that'], ['、'], ['いっしょに', 'issho ni', 'together'], ['テニス', 'tenisu', 'tennis'], ['を', 'o', '(object)'], ['しました', 'shimashita', 'did / played'], ['。']],
        en: 'After that, we played tennis together.',
      },
      {
        t: [['ゆうがた', 'yuugata', 'evening'], ['、'], ['きっさてん', 'kissaten', 'coffee shop'], ['で', 'de', 'at'], ['コーヒー', 'koohii', 'coffee'], ['を', 'o', '(object)'], ['のみました', 'nomimashita', 'drank'], ['。']],
        en: 'In the evening, we drank coffee at a coffee shop.',
      },
      {
        t: [['にちようび', 'nichiyoubi', 'Sunday'], ['は', 'wa', '(topic)'], ['どこ', 'doko', 'where'], ['へ', 'e', 'to'], ['も', 'mo', '(not) any-'], ['いきませんでした', 'ikimasen deshita', 'did not go'], ['。']],
        en: 'On Sunday I didn’t go anywhere.',
      },
      {
        t: [['うち', 'uchi', 'home'], ['で', 'de', 'at'], ['ほん', 'hon', 'book'], ['を', 'o', '(object)'], ['よみました', 'yomimashita', 'read'], ['。']],
        en: 'I read a book at home.',
      },
      {
        t: [['よる', 'yoru', 'night'], ['は', 'wa', '(topic)'], ['はやく', 'hayaku', 'early'], ['ねました', 'nemashita', 'went to bed'], ['。']],
        en: 'At night I went to bed early.',
      },
      {
        t: [['たのしい', 'tanoshii', 'fun'], ['しゅうまつ', 'shuumatsu', 'weekend'], ['でした', 'deshita', 'was'], ['。']],
        en: 'It was a fun weekend.',
      },
    ],
    questions: [
      { q: 'What sport did they play on Saturday?', opts: ['Soccer', 'Swimming', 'Baseball', 'Tennis'], ans: 3 },
      { q: 'What did the writer do on Sunday?', opts: ['Went to the park', 'Read a book at home', 'Went shopping', 'Played tennis'], ans: 1 },
      { q: 'Where did they drink coffee?', opts: ['At a coffee shop', 'At home', 'In the park', 'At school'], ans: 0 },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping at the department store',
    jp: 'デパートで かいもの',
    level: 2,
    topic: 'Shopping',
    lines: [
      {
        t: [['きのう', 'kinou', 'yesterday'], ['、'], ['デパート', 'depaato', 'department store'], ['へ', 'e', 'to'], ['かいもの', 'kaimono', 'shopping'], ['に', 'ni', '(purpose)'], ['いきました', 'ikimashita', 'went'], ['。']],
        en: 'Yesterday I went shopping at a department store.',
      },
      {
        t: [['あかい', 'akai', 'red'], ['セーター', 'seetaa', 'sweater'], ['が', 'ga', '(object of wanting)'], ['ほしかったです', 'hoshikatta desu', 'wanted'], ['。']],
        en: 'I wanted a red sweater.',
      },
      {
        t: [['でも', 'demo', 'but'], ['、'], ['あかい', 'akai', 'red'], ['セーター', 'seetaa', 'sweater'], ['は', 'wa', '(topic)'], ['たかかったです', 'takakatta desu', 'was expensive'], ['。']],
        en: 'But the red sweater was expensive.',
      },
      {
        t: [['いちまんえん', 'ichiman-en', '10,000 yen'], ['でした', 'deshita', 'was'], ['。']],
        en: 'It was 10,000 yen.',
      },
      {
        t: [['あおい', 'aoi', 'blue'], ['セーター', 'seetaa', 'sweater'], ['は', 'wa', '(topic)'], ['ごせんえん', 'gosen-en', '5,000 yen'], ['でした', 'deshita', 'was'], ['。']],
        en: 'The blue sweater was 5,000 yen.',
      },
      {
        t: [['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['あおい', 'aoi', 'blue'], ['セーター', 'seetaa', 'sweater'], ['を', 'o', '(object)'], ['かいました', 'kaimashita', 'bought'], ['。']],
        en: 'I bought the blue sweater.',
      },
      {
        t: [['それから', 'sorekara', 'after that'], ['、'], ['くつした', 'kutsushita', 'socks'], ['も', 'mo', 'also'], ['かいました', 'kaimashita', 'bought'], ['。']],
        en: 'I also bought some socks.',
      },
      {
        t: [['くつした', 'kutsushita', 'socks'], ['は', 'wa', '(topic)'], ['さんびゃくえん', 'sanbyaku-en', '300 yen'], ['でした', 'deshita', 'was'], ['。']],
        en: 'The socks were 300 yen.',
      },
      {
        t: [['ぜんぶで', 'zenbu de', 'in total'], ['ごせんさんびゃくえん', 'gosen sanbyaku-en', '5,300 yen'], ['でした', 'deshita', 'was'], ['。']],
        en: 'It was 5,300 yen in total.',
      },
    ],
    questions: [
      { q: 'Which sweater did the writer buy?', opts: ['The red one', 'The white one', 'The blue one', 'None'], ans: 2 },
      { q: 'How much was the red sweater?', opts: ['5,000 yen', '10,000 yen', '300 yen', '5,300 yen'], ans: 1 },
      { q: 'How much did the writer spend in total?', opts: ['5,000 yen', '10,300 yen', '3,500 yen', '5,300 yen'], ans: 3 },
    ],
  },
  {
    id: 'restaurant',
    title: 'At a restaurant',
    jp: 'レストランで',
    level: 2,
    topic: 'Food',
    lines: [
      {
        t: [['きのう', 'kinou', 'yesterday'], ['の', 'no', '’s'], ['よる', 'yoru', 'night'], ['、'], ['かぞく', 'kazoku', 'family'], ['と', 'to', 'with'], ['レストラン', 'resutoran', 'restaurant'], ['へ', 'e', 'to'], ['いきました', 'ikimashita', 'went'], ['。']],
        en: 'Last night I went to a restaurant with my family.',
      },
      {
        t: [['えき', 'eki', 'station'], ['の', 'no', 'of'], ['ちかく', 'chikaku', 'near'], ['の', 'no', '(linking)'], ['ちいさい', 'chiisai', 'small'], ['レストラン', 'resutoran', 'restaurant'], ['です', 'desu', 'is'], ['。']],
        en: 'It is a small restaurant near the station.',
      },
      {
        t: [['ちち', 'chichi', '(my) father'], ['は', 'wa', '(topic)'], ['ステーキ', 'suteeki', 'steak'], ['に', 'ni', '(choice)'], ['しました', 'shimashita', 'decided on'], ['。']],
        en: 'My father had the steak.',
      },
      {
        t: [['はは', 'haha', '(my) mother'], ['と', 'to', 'and'], ['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['スパゲッティ', 'supagetti', 'spaghetti'], ['を', 'o', '(object)'], ['たべました', 'tabemashita', 'ate'], ['。']],
        en: 'My mother and I ate spaghetti.',
      },
      {
        t: [['いもうと', 'imouto', '(my) younger sister'], ['は', 'wa', '(topic)'], ['カレー', 'karee', 'curry'], ['を', 'o', '(object)'], ['たべました', 'tabemashita', 'ate'], ['。']],
        en: 'My younger sister ate curry.',
      },
      {
        t: [['りょうり', 'ryouri', 'food / cooking'], ['は', 'wa', '(topic)'], ['とても', 'totemo', 'very'], ['おいしかったです', 'oishikatta desu', 'was delicious'], ['。']],
        en: 'The food was very delicious.',
      },
      {
        t: [['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['アイスクリーム', 'aisukuriimu', 'ice cream'], ['も', 'mo', 'also'], ['たべました', 'tabemashita', 'ate'], ['。']],
        en: 'I also ate ice cream.',
      },
      {
        t: [['ちょっと', 'chotto', 'a little'], ['たかかったです', 'takakatta desu', 'was expensive'], ['が', 'ga', 'but'], ['、'], ['いい', 'ii', 'good'], ['レストラン', 'resutoran', 'restaurant'], ['でした', 'deshita', 'was'], ['。']],
        en: 'It was a little expensive, but it was a good restaurant.',
      },
    ],
    questions: [
      { q: 'What did the father have?', opts: ['Steak', 'Curry', 'Spaghetti', 'Ice cream'], ans: 0 },
      { q: 'What did the younger sister eat?', opts: ['Spaghetti', 'Steak', 'Curry', 'Fish'], ans: 2 },
      { q: 'Where is the restaurant?', opts: ['Near the school', 'Near the station', 'In a department store', 'Next to their house'], ans: 1 },
    ],
  },
  {
    id: 'school',
    title: 'My school',
    jp: 'わたしの がっこう',
    level: 2,
    topic: 'School',
    lines: [
      {
        t: [['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['だいがく', 'daigaku', 'university'], ['で', 'de', 'at'], ['にほんご', 'nihongo', 'Japanese (language)'], ['を', 'o', '(object)'], ['べんきょうします', 'benkyou shimasu', 'study'], ['。']],
        en: 'I study Japanese at university.',
      },
      {
        t: [['にほんご', 'nihongo', 'Japanese (language)'], ['の', 'no', '(linking)'], ['クラス', 'kurasu', 'class'], ['は', 'wa', '(topic)'], ['まいにち', 'mainichi', 'every day'], ['あります', 'arimasu', 'there is'], ['。']],
        en: 'There is a Japanese class every day.',
      },
      {
        t: [['クラス', 'kurasu', 'class'], ['は', 'wa', '(topic)'], ['くじ', 'ku-ji', '9 o’clock'], ['から', 'kara', 'from'], ['じゅうじはん', 'juu-ji han', '10:30'], ['まで', 'made', 'until'], ['です', 'desu', 'is'], ['。']],
        en: 'Class is from 9:00 to 10:30.',
      },
      {
        t: [['せんせい', 'sensei', 'teacher'], ['は', 'wa', '(topic)'], ['やまだせんせい', 'Yamada-sensei', 'Professor Yamada'], ['です', 'desu', 'is'], ['。']],
        en: 'The teacher is Professor Yamada.',
      },
      {
        t: [['やまだせんせい', 'Yamada-sensei', 'Professor Yamada'], ['は', 'wa', '(topic)'], ['やさしい', 'yasashii', 'kind'], ['です', 'desu', 'is'], ['。']],
        en: 'Professor Yamada is kind.',
      },
      {
        t: [['クラス', 'kurasu', 'class'], ['に', 'ni', 'in'], ['がくせい', 'gakusei', 'student(s)'], ['が', 'ga', '(subject)'], ['じゅうにん', 'juunin', 'ten people'], ['います', 'imasu', 'there are'], ['。']],
        en: 'There are ten students in the class.',
      },
      {
        t: [['ひるごはん', 'hirugohan', 'lunch'], ['は', 'wa', '(topic)'], ['しょくどう', 'shokudou', 'cafeteria'], ['で', 'de', 'at'], ['たべます', 'tabemasu', 'eat'], ['。']],
        en: 'I eat lunch in the cafeteria.',
      },
      {
        t: [['ごご', 'gogo', 'afternoon'], ['は', 'wa', '(topic)'], ['としょかん', 'toshokan', 'library'], ['で', 'de', 'at'], ['しゅくだい', 'shukudai', 'homework'], ['を', 'o', '(object)'], ['します', 'shimasu', 'do'], ['。']],
        en: 'In the afternoon, I do my homework in the library.',
      },
      {
        t: [['にほんご', 'nihongo', 'Japanese (language)'], ['は', 'wa', '(topic)'], ['むずかしい', 'muzukashii', 'difficult'], ['です', 'desu', 'is'], ['が', 'ga', 'but'], ['、'], ['おもしろい', 'omoshiroi', 'interesting'], ['です', 'desu', 'is'], ['。']],
        en: 'Japanese is difficult, but it is interesting.',
      },
    ],
    questions: [
      { q: 'What time does the Japanese class end?', opts: ['9:00', '10:00', '10:30', '12:00'], ans: 2 },
      { q: 'How many students are in the class?', opts: ['Ten', 'Two', 'Five', 'Twenty'], ans: 0 },
      { q: 'Where does the writer do homework?', opts: ['At home', 'In the cafeteria', 'In the classroom', 'In the library'], ans: 3 },
    ],
  },

  // ───────────── Level 3 ─────────────
  {
    id: 'seasons',
    title: 'Spring and winter',
    jp: 'はると ふゆ',
    level: 3,
    topic: 'Weather & seasons',
    lines: [
      {
        t: [['にほん', 'nihon', 'Japan'], ['に', 'ni', 'in'], ['は', 'wa', '(topic)'], ['はる', 'haru', 'spring'], ['、'], ['なつ', 'natsu', 'summer'], ['、'], ['あき', 'aki', 'autumn'], ['、'], ['ふゆ', 'fuyu', 'winter'], ['が', 'ga', '(subject)'], ['あります', 'arimasu', 'there are'], ['。']],
        en: 'Japan has spring, summer, autumn and winter.',
      },
      {
        t: [['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['はる', 'haru', 'spring'], ['が', 'ga', '(object of liking)'], ['いちばん', 'ichiban', 'the most'], ['すき', 'suki', 'like'], ['です', 'desu', 'is'], ['。']],
        en: 'I like spring the most.',
      },
      {
        t: [['はる', 'haru', 'spring'], ['は', 'wa', '(topic)'], ['あたたかくて', 'atatakakute', 'is warm, and'], ['、'], ['さくら', 'sakura', 'cherry blossoms'], ['が', 'ga', '(subject)'], ['きれい', 'kirei', 'pretty'], ['です', 'desu', 'is'], ['。']],
        en: 'Spring is warm, and the cherry blossoms are pretty.',
      },
      {
        t: [['なつ', 'natsu', 'summer'], ['は', 'wa', '(topic)'], ['はる', 'haru', 'spring'], ['より', 'yori', 'than'], ['あつい', 'atsui', 'hot'], ['です', 'desu', 'is'], ['。']],
        en: 'Summer is hotter than spring.',
      },
      {
        t: [['なつ', 'natsu', 'summer'], ['は', 'wa', '(topic)'], ['よく', 'yoku', 'often'], ['うみ', 'umi', 'sea'], ['へ', 'e', 'to'], ['いって', 'itte', 'go, and'], ['、'], ['およぎます', 'oyogimasu', 'swim'], ['。']],
        en: 'In summer, I often go to the sea and swim.',
      },
      {
        t: [['ふゆ', 'fuyu', 'winter'], ['は', 'wa', '(topic)'], ['とても', 'totemo', 'very'], ['さむい', 'samui', 'cold'], ['です', 'desu', 'is'], ['から', 'kara', 'so / because'], ['、'], ['あまり', 'amari', '(not) much'], ['そと', 'soto', 'outside'], ['へ', 'e', 'to'], ['でません', 'demasen', 'do not go out'], ['。']],
        en: 'Winter is very cold, so I don’t go outside much.',
      },
      {
        t: [['いま', 'ima', 'now'], ['は', 'wa', '(topic)'], ['ふゆ', 'fuyu', 'winter'], ['で', 'de', 'is, and'], ['、'], ['そと', 'soto', 'outside'], ['で', 'de', 'at'], ['ゆき', 'yuki', 'snow'], ['が', 'ga', '(subject)'], ['ふっています', 'futte imasu', 'is falling'], ['。']],
        en: 'It is winter now, and snow is falling outside.',
      },
      {
        t: [['はやく', 'hayaku', 'soon / quickly'], ['さくら', 'sakura', 'cherry blossoms'], ['が', 'ga', '(object of wanting)'], ['みたいです', 'mitai desu', 'want to see'], ['。']],
        en: 'I want to see the cherry blossoms soon.',
      },
    ],
    questions: [
      { q: 'Which season does the writer like best?', opts: ['Summer', 'Spring', 'Autumn', 'Winter'], ans: 1 },
      { q: 'What does the writer often do in summer?', opts: ['Swim in the sea', 'Look at cherry blossoms', 'Stay at home', 'Go skiing'], ans: 0 },
      { q: 'What is the weather like now?', opts: ['It is sunny and warm', 'It is raining', 'It is hot', 'It is snowing'], ans: 3 },
      { q: 'Which is true?', opts: ['Spring is hotter than summer', 'Winter is warm', 'Summer is hotter than spring', 'The writer goes out a lot in winter'], ans: 2 },
    ],
  },
  {
    id: 'kyoto-trip',
    title: 'A trip to Kyoto',
    jp: 'きょうと りょこう',
    level: 3,
    topic: 'Travel',
    lines: [
      {
        t: [['せんしゅう', 'senshuu', 'last week'], ['、'], ['ともだち', 'tomodachi', 'friend'], ['と', 'to', 'with'], ['きょうと', 'kyouto', 'Kyoto'], ['へ', 'e', 'to'], ['りょこう', 'ryokou', 'trip'], ['に', 'ni', '(purpose)'], ['いきました', 'ikimashita', 'went'], ['。']],
        en: 'Last week I went on a trip to Kyoto with a friend.',
      },
      {
        t: [['とうきょう', 'toukyou', 'Tokyo'], ['から', 'kara', 'from'], ['きょうと', 'kyouto', 'Kyoto'], ['まで', 'made', 'to / until'], ['しんかんせん', 'shinkansen', 'bullet train'], ['で', 'de', 'by'], ['にじかん', 'ni-jikan', 'two hours'], ['ぐらい', 'gurai', 'about'], ['かかりました', 'kakarimashita', 'took (time)'], ['。']],
        en: 'From Tokyo to Kyoto it took about two hours by bullet train.',
      },
      {
        t: [['きょうと', 'kyouto', 'Kyoto'], ['に', 'ni', 'in'], ['は', 'wa', '(topic)'], ['ふるい', 'furui', 'old'], ['おてら', 'otera', 'temple(s)'], ['が', 'ga', '(subject)'], ['たくさん', 'takusan', 'many'], ['あります', 'arimasu', 'there are'], ['。']],
        en: 'There are many old temples in Kyoto.',
      },
      {
        t: [['わたしたち', 'watashitachi', 'we'], ['は', 'wa', '(topic)'], ['おてら', 'otera', 'temple(s)'], ['を', 'o', '(object)'], ['みて', 'mite', 'saw, and'], ['、'], ['しゃしん', 'shashin', 'photo(s)'], ['を', 'o', '(object)'], ['とりました', 'torimashita', 'took'], ['。']],
        en: 'We looked at the temples and took photos.',
      },
      {
        t: [['ひる', 'hiru', 'lunchtime'], ['は', 'wa', '(topic)'], ['ゆうめいな', 'yuumeina', 'famous'], ['おみせ', 'omise', 'shop / restaurant'], ['で', 'de', 'at'], ['そば', 'soba', 'soba noodles'], ['を', 'o', '(object)'], ['たべました', 'tabemashita', 'ate'], ['。']],
        en: 'For lunch, we ate soba at a famous restaurant.',
      },
      {
        t: [['きょうと', 'kyouto', 'Kyoto'], ['は', 'wa', '(topic)'], ['とうきょう', 'toukyou', 'Tokyo'], ['より', 'yori', 'than'], ['しずか', 'shizuka', 'quiet'], ['でした', 'deshita', 'was'], ['。']],
        en: 'Kyoto was quieter than Tokyo.',
      },
      {
        t: [['よる', 'yoru', 'night'], ['は', 'wa', '(topic)'], ['ホテル', 'hoteru', 'hotel'], ['の', 'no', 'of'], ['ちかく', 'chikaku', 'near / area'], ['を', 'o', '(through)'], ['さんぽしました', 'sanpo shimashita', 'took a walk'], ['。']],
        en: 'At night, we took a walk near the hotel.',
      },
      {
        t: [['つかれました', 'tsukaremashita', 'got tired'], ['が', 'ga', 'but'], ['、'], ['とても', 'totemo', 'very'], ['たのしかったです', 'tanoshikatta desu', 'was fun'], ['。']],
        en: 'I got tired, but it was a lot of fun.',
      },
      {
        t: [['また', 'mata', 'again'], ['あき', 'aki', 'autumn'], ['に', 'ni', 'in'], ['いきたいです', 'ikitai desu', 'want to go'], ['。']],
        en: 'I want to go again in autumn.',
      },
    ],
    questions: [
      { q: 'How did they travel to Kyoto?', opts: ['By plane', 'By car', 'By bullet train', 'By bus'], ans: 2 },
      { q: 'How long did the trip from Tokyo take?', opts: ['About two hours', 'About one hour', 'About three hours', 'About five hours'], ans: 0 },
      { q: 'What did they eat for lunch?', opts: ['Sushi', 'Curry', 'Ramen', 'Soba'], ans: 3 },
      { q: 'What did the writer think of Kyoto compared with Tokyo?', opts: ['It was busier', 'It was quieter', 'It was bigger', 'It was more expensive'], ans: 1 },
    ],
  },
  {
    id: 'birthday',
    title: 'My birthday',
    jp: 'わたしの たんじょうび',
    level: 3,
    topic: 'Celebrations',
    lines: [
      {
        t: [['きのう', 'kinou', 'yesterday'], ['は', 'wa', '(topic)'], ['わたし', 'watashi', 'I'], ['の', 'no', '’s / my'], ['たんじょうび', 'tanjoubi', 'birthday'], ['でした', 'deshita', 'was'], ['。']],
        en: 'Yesterday was my birthday.',
      },
      {
        t: [['はたち', 'hatachi', 'twenty years old'], ['に', 'ni', '(become)'], ['なりました', 'narimashita', 'became'], ['。']],
        en: 'I turned twenty.',
      },
      {
        t: [['ゆうがた', 'yuugata', 'evening'], ['、'], ['ともだち', 'tomodachi', 'friend(s)'], ['が', 'ga', '(subject)'], ['さんにん', 'sannin', 'three people'], ['うち', 'uchi', 'home'], ['に', 'ni', 'to'], ['きました', 'kimashita', 'came'], ['。']],
        en: 'In the evening, three friends came to my house.',
      },
      {
        t: [['みんなで', 'minna de', 'all together'], ['ケーキ', 'keeki', 'cake'], ['を', 'o', '(object)'], ['たべて', 'tabete', 'ate, and'], ['、'], ['うた', 'uta', 'song(s)'], ['を', 'o', '(object)'], ['うたいました', 'utaimashita', 'sang'], ['。']],
        en: 'We all ate cake and sang songs.',
      },
      {
        t: [['ともだち', 'tomodachi', 'friend(s)'], ['から', 'kara', 'from'], ['あおい', 'aoi', 'blue'], ['かさ', 'kasa', 'umbrella'], ['を', 'o', '(object)'], ['もらいました', 'moraimashita', 'received'], ['。']],
        en: 'I got a blue umbrella from my friends.',
      },
      {
        t: [['あに', 'ani', '(my) older brother'], ['から', 'kara', 'from'], ['は', 'wa', '(contrast)'], ['とけい', 'tokei', 'watch'], ['を', 'o', '(object)'], ['もらいました', 'moraimashita', 'received'], ['。']],
        en: 'From my older brother, I got a watch.',
      },
      {
        t: [['あたらしい', 'atarashii', 'new'], ['かさ', 'kasa', 'umbrella'], ['が', 'ga', '(object of wanting)'], ['ほしかったです', 'hoshikatta desu', 'wanted'], ['から', 'kara', 'because'], ['、'], ['とても', 'totemo', 'very'], ['よかったです', 'yokatta desu', 'was good'], ['。']],
        en: 'I wanted a new umbrella, so I was really glad.',
      },
      {
        t: [['とても', 'totemo', 'very'], ['たのしい', 'tanoshii', 'fun'], ['いちにち', 'ichinichi', 'day'], ['でした', 'deshita', 'was'], ['。']],
        en: 'It was a very fun day.',
      },
    ],
    questions: [
      { q: 'How old is the writer now?', opts: ['18', '19', '21', '20'], ans: 3 },
      { q: 'How many friends came to the house?', opts: ['Two', 'Three', 'Four', 'Five'], ans: 1 },
      { q: 'What did the older brother give the writer?', opts: ['A watch', 'An umbrella', 'A cake', 'A book'], ans: 0 },
      { q: 'Why was the writer glad about the umbrella?', opts: ['It was expensive', 'It was red', 'The writer wanted a new umbrella', 'It was raining'], ans: 2 },
    ],
  },
  {
    id: 'letter',
    title: 'A letter to a friend',
    jp: 'ともだちへの てがみ',
    level: 3,
    topic: 'Letters',
    lines: [
      {
        t: [['さくらさん', 'Sakura-san', 'Sakura'], ['、'], ['おげんき', 'ogenki', 'well / healthy'], ['です', 'desu', 'are'], ['か', 'ka', '(question)'], ['。']],
        en: 'Sakura, how are you?',
      },
      {
        t: [['わたし', 'watashi', 'I'], ['は', 'wa', '(topic)'], ['いま', 'ima', 'now'], ['、'], ['おおさか', 'oosaka', 'Osaka'], ['に', 'ni', 'in'], ['すんでいます', 'sunde imasu', 'live'], ['。']],
        en: 'I live in Osaka now.',
      },
      {
        t: [['まいにち', 'mainichi', 'every day'], ['、'], ['にほんご', 'nihongo', 'Japanese (language)'], ['の', 'no', '(linking)'], ['がっこう', 'gakkou', 'school'], ['へ', 'e', 'to'], ['いっています', 'itte imasu', 'go (regularly)'], ['。']],
        en: 'I go to a Japanese language school every day.',
      },
      {
        t: [['がっこう', 'gakkou', 'school'], ['は', 'wa', '(topic)'], ['うち', 'uchi', 'home'], ['から', 'kara', 'from'], ['ちかい', 'chikai', 'near'], ['です', 'desu', 'is'], ['から', 'kara', 'so / because'], ['、'], ['あるいて', 'aruite', 'on foot'], ['いきます', 'ikimasu', 'go'], ['。']],
        en: 'The school is close to my home, so I walk there.',
      },
      {
        t: [['おおさか', 'oosaka', 'Osaka'], ['の', 'no', '’s'], ['たべもの', 'tabemono', 'food'], ['は', 'wa', '(topic)'], ['やすくて', 'yasukute', 'is cheap, and'], ['、'], ['おいしい', 'oishii', 'delicious'], ['です', 'desu', 'is'], ['。']],
        en: 'The food in Osaka is cheap and delicious.',
      },
      {
        t: [['でも', 'demo', 'but'], ['、'], ['なつ', 'natsu', 'summer'], ['は', 'wa', '(topic)'], ['とうきょう', 'toukyou', 'Tokyo'], ['より', 'yori', 'than'], ['あつい', 'atsui', 'hot'], ['です', 'desu', 'is'], ['。']],
        en: 'But the summer here is hotter than in Tokyo.',
      },
      {
        t: [['らいげつ', 'raigetsu', 'next month'], ['、'], ['とうきょう', 'toukyou', 'Tokyo'], ['へ', 'e', 'to'], ['いきます', 'ikimasu', 'will go'], ['。']],
        en: 'Next month, I will go to Tokyo.',
      },
      {
        t: [['いっしょに', 'issho ni', 'together'], ['ごはん', 'gohan', 'a meal'], ['を', 'o', '(object)'], ['たべません', 'tabemasen', 'won’t (we) eat'], ['か', 'ka', '(question)'], ['。']],
        en: 'Shall we have a meal together?',
      },
      {
        t: [['また', 'mata', 'again'], ['てがみ', 'tegami', 'letter'], ['を', 'o', '(object)'], ['ください', 'kudasai', 'please give'], ['。']],
        en: 'Please write to me again.',
      },
      {
        t: [['マリア', 'Maria', 'Maria'], ['より', 'yori', 'from']],
        en: 'From Maria',
      },
    ],
    questions: [
      { q: 'Where does Maria live now?', opts: ['Tokyo', 'Kyoto', 'Osaka', 'Nara'], ans: 2 },
      { q: 'How does Maria go to school?', opts: ['She walks', 'By train', 'By bus', 'By bicycle'], ans: 0 },
      { q: 'What does Maria say about the food in Osaka?', opts: ['It is expensive', 'It is cheap and delicious', 'It is too spicy', 'It is the same as in Tokyo'], ans: 1 },
      { q: 'What will Maria do next month?', opts: ['Start a new school', 'Move to Kyoto', 'Go back home', 'Go to Tokyo'], ans: 3 },
    ],
  },
];
