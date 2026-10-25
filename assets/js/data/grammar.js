// N5 grammar patterns, grouped by category. Each item: pattern, meaning, structure, explanation, examples[], optional conjugationTable / extraNote / badge.
// Plain data — edit freely. Loaded as a classic script, so these consts are global.

const GRAMMAR_SECTIONS = [
  {
    id:'sentences', title:'Basic Sentence Structures', icon:'🗣', colorClass:'cat-sentences',
    items:[
      {
        pattern:'〜は〜です', meaning:'X is Y (polite affirmative)',
        structure:'[Topic]は [Noun/Adj]です',
        explanation:'The most fundamental sentence pattern. は (wa) marks the topic. です (desu) is the polite copula meaning "to be".',
        examples:[
          {jp:'わたしは がくせいです。',rom:'Watashi wa gakusei desu.',en:'I am a student.'},
          {jp:'これは ほんです。',rom:'Kore wa hon desu.',en:'This is a book.'},
          {jp:'やまださんは せんせいです。',rom:'Yamada-san wa sensei desu.',en:'Yamada-san is a teacher.'}
        ]
      },
      {
        pattern:'〜は〜ですか', meaning:'Is X Y? (yes/no question)',
        structure:'[Topic]は [Noun/Adj]ですか',
        explanation:'Add か (ka) to the end of a statement to form a question. No rising intonation needed in written form.',
        examples:[
          {jp:'あなたは にほんじんですか。',rom:'Anata wa nihonjin desu ka?',en:'Are you Japanese?'},
          {jp:'これは ぺんですか。',rom:'Kore wa pen desu ka?',en:'Is this a pen?'}
        ]
      },
      {
        pattern:'〜は〜じゃないです / ではありません', meaning:'X is not Y (negative)',
        structure:'[Topic]は [Noun]じゃないです (casual) / ではありません (formal)',
        explanation:'じゃないです is the casual negative. ではありません is more formal. Both mean "is not".',
        examples:[
          {jp:'わたしは せんせいじゃないです。',rom:'Watashi wa sensei ja nai desu.',en:'I am not a teacher.'},
          {jp:'これは さかなではありません。',rom:'Kore wa sakana dewa arimasen.',en:'This is not fish.'}
        ]
      },
      {
        pattern:'〜の〜', meaning:'Possessive / descriptor (of)',
        structure:'[Noun A]の[Noun B] = "B of A" or "A\'s B"',
        explanation:'の (no) connects two nouns. It shows possession, origin, material, or categorization.',
        examples:[
          {jp:'わたしの ほん',rom:'Watashi no hon',en:'My book'},
          {jp:'にほんの くるま',rom:'Nihon no kuruma',en:'A Japanese car'},
          {jp:'ともだちの なまえ',rom:'Tomodachi no namae',en:"Friend's name"}
        ]
      },
    ]
  },
  {
    id:'particles', title:'Particles (じょし)', icon:'🔵', colorClass:'cat-particles',
    items:[
      {
        pattern:'は (wa) — Topic Marker', meaning:'Marks the topic of the sentence',
        structure:'[Topic]は ...',
        explanation:'は marks what the sentence is about. Note: it is written as は (ha) but read as "wa" when used as a particle.',
        examples:[{jp:'わたしは がくせいです。',rom:'Watashi wa gakusei desu.',en:'I am a student.'},{jp:'きょうは さむいです。',rom:'Kyou wa samui desu.',en:'Today is cold.'}]
      },
      {
        pattern:'が (ga) — Subject Marker', meaning:'Marks the grammatical subject; emphasis or new info',
        structure:'[Subject]が ...',
        explanation:'が marks the subject, especially for new information, emphasis, or with verbs like あります/います. は is for known topics; が for specific/new focus.',
        examples:[{jp:'ねこが います。',rom:'Neko ga imasu.',en:'There is a cat. (specific)'},{jp:'だれが きましたか。',rom:'Dare ga kimashita ka?',en:'Who came?'}]
      },
      {
        pattern:'を (wo) — Object Marker', meaning:'Marks the direct object of a verb',
        structure:'[Object]を [Verb]',
        explanation:'を marks what the verb acts upon. Written を but pronounced "o".',
        examples:[{jp:'りんごを たべます。',rom:'Ringo o tabemasu.',en:'I eat an apple.'},{jp:'にほんごを べんきょうします。',rom:'Nihongo o benkyou shimasu.',en:'I study Japanese.'}]
      },
      {
        pattern:'に (ni) — Direction / Location / Time', meaning:'To (direction), at/in (location of existence), at (time)',
        structure:'[Place]に います/あります | [Place]に いきます | [Time]に',
        explanation:'に has many uses: (1) destination with movement verbs, (2) location where something exists, (3) specific time point.',
        examples:[{jp:'えきに います。',rom:'Eki ni imasu.',en:'I am at the station.'},{jp:'がっこうに いきます。',rom:'Gakkou ni ikimasu.',en:'I go to school.'},{jp:'くじに おきます。',rom:'Kuji ni okimasu.',en:'I wake up at 9.'}]
      },
      {
        pattern:'で (de) — Location of Action / Means', meaning:'At/in (where action happens), by/with (means/tool)',
        structure:'[Place]で [Action] | [Tool]で [Action]',
        explanation:'で marks where an action takes place, or the means/tool used. Different from に which marks existence location.',
        examples:[{jp:'がっこうで べんきょうします。',rom:'Gakkou de benkyou shimasu.',en:'I study at school.'},{jp:'はしで たべます。',rom:'Hashi de tabemasu.',en:'I eat with chopsticks.'}]
      },
      {
        pattern:'へ (e) — Direction', meaning:'Towards (direction of movement)',
        structure:'[Place]へ いきます/きます/かえります',
        explanation:'へ (written he, read "e") indicates direction. Often interchangeable with に for direction, but に is more specific (destination), へ more general (towards).',
        examples:[{jp:'にほんへ いきます。',rom:'Nihon e ikimasu.',en:'I go to Japan.'},{jp:'うちへ かえります。',rom:'Uchi e kaerimasu.',en:'I return home.'}]
      },
      {
        pattern:'と (to) — And / With', meaning:'And (connecting nouns) / With (doing together)',
        structure:'[Noun]と[Noun] | [Person]と [Verb]',
        explanation:'と has two main uses: listing nouns exhaustively ("A and B"), or doing something together with someone.',
        examples:[{jp:'ねこといぬが います。',rom:'Neko to inu ga imasu.',en:'There is a cat and a dog.'},{jp:'ともだちと えいがを みます。',rom:'Tomodachi to eiga o mimasu.',en:'I watch a movie with my friend.'}]
      },
      {
        pattern:'も (mo) — Also / Too', meaning:'Marks an additional item that shares the same predicate',
        structure:'[Noun]も [Predicate]',
        explanation:'も replaces は or が to mean "also" or "too". Stacking もs means "both... and...".',
        examples:[{jp:'わたしも がくせいです。',rom:'Watashi mo gakusei desu.',en:'I am also a student.'},{jp:'ねこも いぬも います。',rom:'Neko mo inu mo imasu.',en:'There are both cats and dogs.'}]
      },
      {
        pattern:'から〜まで', meaning:'From ~ to ~ (range)',
        structure:'[Start Point]から[End Point]まで',
        explanation:'から means "from" and まで means "until/to". Used for time and place.',
        examples:[{jp:'くじから ごじまで はたらきます。',rom:'Kuji kara goji made hatarakimasu.',en:'I work from 9 to 5.'},{jp:'とうきょうから おおさかまで',rom:'Tokyo kara Osaka made',en:'From Tokyo to Osaka'}]
      },
      {
        pattern:'の (no) — Nominalizer', meaning:'Turns a verb/adj clause into a noun',
        structure:'[Verb / Adj (plain)]のが / のは / のを',
        explanation:'Adding の after a plain-form verb or adjective turns the whole clause into a noun. Very useful for talking about activities.',
        examples:[{jp:'はなすのが すきです。',rom:'Hanasu no ga suki desu.',en:'I like speaking.'},{jp:'たべるのが はやいです。',rom:'Taberu no ga hayai desu.',en:'Eating is fast / I eat fast.'}]
      },
    ]
  },
  {
    id:'verbs', title:'Verbs — Groups 1, 2 & 3', icon:'⚡', colorClass:'cat-verbs',
    items:[
      {
        pattern:'Group 1 Verbs (U-verbs / 五段動詞)', meaning:'Verbs ending in う sound consonant + u',
        structure:'Stem ends in: く・ぐ・す・つ・ぬ・ぶ・む・る (with consonant before ru) ・う',
        explanation:'Group 1 verbs (also called Godan or U-verbs) end in a う-row sound. To conjugate, change the final syllable. IMPORTANT: If a verb ends in る but has an /a/, /u/, /o/ vowel before the る, it\'s usually Group 1.',
        conjugationTable:[
          ['Form','Example: かく (to write)','Example: のむ (to drink)'],
          ['Dictionary','かく','のむ'],
          ['Masu (polite)','かきます','のみます'],
          ['Masen (negative)','かきません','のみません'],
          ['Mashita (past)','かきました','のみました'],
          ['Te-form','かいて','のんで'],
          ['Nai-form (plain neg)','かかない','のまない'],
          ['Ta-form (plain past)','かいた','のんだ'],
        ],
        examples:[
          {jp:'まいにち にほんごを かきます。',rom:'Mainichi Nihongo o kakimasu.',en:'I write Japanese every day.'},
          {jp:'コーヒーを のみません。',rom:'Koohii o nomimasen.',en:'I don\'t drink coffee.'},
        ],
        badge:'g1',
        extraNote:'Common G1 verbs: かく(write), のむ(drink), いく(go), かう(buy), はなす(speak), まつ(wait), よむ(read), おわる(finish)'
      },
      {
        pattern:'Group 2 Verbs (RU-verbs / 一段動詞)', meaning:'Verbs ending in る with i or e sound before it',
        structure:'[Stem ending in い or え sound] + る',
        explanation:'Group 2 verbs (Ichidan / RU-verbs) always end in る, with an い or え vowel sound before it. Conjugation is simpler: just drop the る and add the ending.',
        conjugationTable:[
          ['Form','Example: たべる (to eat)','Example: みる (to see)'],
          ['Dictionary','たべる','みる'],
          ['Masu (polite)','たべます','みます'],
          ['Masen (negative)','たべません','みません'],
          ['Mashita (past)','たべました','みました'],
          ['Te-form','たべて','みて'],
          ['Nai-form (plain neg)','たべない','みない'],
          ['Ta-form (plain past)','たべた','みた'],
        ],
        examples:[
          {jp:'まいあさ ごはんを たべます。',rom:'Maiasa gohan o tabemasu.',en:'I eat breakfast every morning.'},
          {jp:'えいがを みません。',rom:'Eiga o mimasen.',en:'I don\'t watch movies.'},
        ],
        badge:'g2',
        extraNote:'Common G2 verbs: たべる(eat), みる(see/watch), きる(wear), ねる(sleep), おきる(wake up), でる(exit), おしえる(teach), かりる(borrow)'
      },
      {
        pattern:'Group 3 Verbs (Irregular / 不規則動詞)', meaning:'Only 2 verbs: する (do) and くる (come)',
        structure:'する → します | くる → きます',
        explanation:'There are only TWO irregular verbs in Japanese: する (to do) and くる (to come). They must be memorized. する is used to create compound verbs like べんきょうする (to study).',
        conjugationTable:[
          ['Form','する (to do)','くる (to come)'],
          ['Dictionary','する','くる'],
          ['Masu','します','きます'],
          ['Masen','しません','きません'],
          ['Mashita','しました','きました'],
          ['Te-form','して','きて'],
          ['Nai-form','しない','こない'],
          ['Ta-form','した','きた'],
        ],
        examples:[
          {jp:'まいにち べんきょうします。',rom:'Mainichi benkyou shimasu.',en:'I study every day.'},
          {jp:'ともだちが きます。',rom:'Tomodachi ga kimasu.',en:'My friend is coming.'},
          {jp:'かれは うんどうを しました。',rom:'Kare wa undou o shimashita.',en:'He exercised.'},
        ],
        badge:'g3',
        extraNote:'Compound verbs with する: べんきょうする(study), りょこうする(travel), でんわする(call), そうじする(clean), けっこんする(marry)'
      },
      {
        pattern:'Te-form (〜て / 〜で) — Uses', meaning:'Connecting actions, requests, ongoing actions',
        structure:'See conjugation tables above for te-form',
        explanation:'The te-form is crucial. It\'s used for: (1) connecting verbs sequentially, (2) 〜てください (please do), (3) 〜ています (currently doing), (4) 〜てもいいですか (may I?).',
        examples:[
          {jp:'みてください。',rom:'Mite kudasai.',en:'Please look.'},
          {jp:'ほんを よんでいます。',rom:'Hon o yonde imasu.',en:'I am reading a book.'},
          {jp:'はいっても いいですか。',rom:'Haitte mo ii desu ka?',en:'May I come in?'},
          {jp:'おきて、シャワーを あびて、がっこうへ いきます。',rom:'Okite, shawaa o abite, gakkou e ikimasu.',en:'I wake up, take a shower, and go to school.'},
        ]
      },
      {
        pattern:'〜ます / 〜ません / 〜ました / 〜ませんでした', meaning:'Polite present/future | negative | past | past negative',
        structure:'[Verb stem]ます/ません/ました/ませんでした',
        explanation:'The 〜ます form is the standard polite speech level used at N5. The four forms cover present/future, negative, past, and past negative.',
        examples:[
          {jp:'たべます。',rom:'Tabemasu.',en:'I eat. / I will eat.'},
          {jp:'たべません。',rom:'Tabemasen.',en:'I don\'t eat.'},
          {jp:'たべました。',rom:'Tabemashita.',en:'I ate.'},
          {jp:'たべませんでした。',rom:'Tabemasen deshita.',en:'I didn\'t eat.'},
        ]
      },
      {
        pattern:'〜たい / 〜たくない', meaning:'Want to do ~ / Don\'t want to do ~',
        structure:'[Verb stem]たいです / たくないです',
        explanation:'Drop ます from the masu-form and add たい to express "want to do". Conjugates like an い-adjective for negatives and past.',
        examples:[
          {jp:'にほんへ いきたいです。',rom:'Nihon e ikitai desu.',en:'I want to go to Japan.'},
          {jp:'はやく ねたいです。',rom:'Hayaku netai desu.',en:'I want to sleep early.'},
          {jp:'いきたくないです。',rom:'Ikitakunai desu.',en:'I don\'t want to go.'},
        ]
      },
      {
        pattern:'〜ことが できます', meaning:'Can / is able to do ~',
        structure:'[Verb dictionary form]ことが できます',
        explanation:'ことが できます expresses ability. The dictionary (plain) form comes before こと. The noun form できます also works: できます alone = "can do, it\'s possible".',
        examples:[
          {jp:'にほんごを はなすことが できます。',rom:'Nihongo o hanasu koto ga dekimasu.',en:'I can speak Japanese.'},
          {jp:'すいえいを することが できません。',rom:'Suiei o suru koto ga dekimasen.',en:'I cannot swim.'},
        ]
      },
      {
        pattern:'て形 (Te-form / てけい) — How to make it',
        meaning:'The te-form is the connector form of verbs — crucial for N5!',
        structure:'Group 1: sound-change rules | Group 2: drop る + て | Group 3: して / きて',
        explanation:'The te-form is one of the most important forms in Japanese. Each group makes it differently. Group 1 has 5 sub-rules based on the final syllable. Group 2 is simple: drop る, add て. Group 3 is memorized.',
        conjugationTable:[
          ['Ending (G1)','Rule','Example'],
          ['〜く','→ いて','かく → かいて (write)'],
          ['〜ぐ','→ いで','およぐ → およいで (swim)'],
          ['〜す','→ して','はなす → はなして (speak)'],
          ['〜つ・う・る','→ って','まつ→まって / かう→かって / おわる→おわって'],
          ['〜ぬ・ぶ・む','→ んで','のむ → のんで (drink)'],
          ['Group 2: 〜る','drop る + て','たべる → たべて / みる → みて'],
          ['Group 3: する','→ して','べんきょうする → べんきょうして'],
          ['Group 3: くる','→ きて','くる → きて'],
          ['⚠️ Exception','いく → いって','NOT いいて!'],
        ],
        examples:[
          {jp:'はなして、ごはんを たべて、うちへ かえりました。',rom:'Hanashite, gohan o tabete, uchi e kaerimashita.',en:'I talked, ate, and went home.'},
          {jp:'てを あらって、たべてください。',rom:'Te o aratte, tabete kudasai.',en:'Wash your hands and eat.'},
        ],
        badge:'g1',
        extraNote:'💡 Te-form uses: ①Chaining actions ②〜てください (request) ③〜ています (ongoing) ④〜てもいいですか (permission) ⑤〜てはいけません (prohibition)'
      },
      {
        pattern:'ない形 (Nai-form / ないけい) — Negative plain form',
        meaning:'Plain (informal) negative: "do not do"',
        structure:'G1: change last vowel to あ-row + ない | G2: drop る + ない | G3: しない / こない',
        explanation:'The nai-form is the plain (dictionary-level) negative. It\'s used in casual speech, embedded clauses, and as the base for other patterns like ないでください and なければなりません.',
        conjugationTable:[
          ['Group','Verb','Nai-form'],
          ['G1 (〜く)','かく (write)','かかない'],
          ['G1 (〜む)','のむ (drink)','のまない'],
          ['G1 (〜す)','はなす (speak)','はなさない'],
          ['G1 (〜う)','かう (buy)','かわない ⚠️ NOT かあない'],
          ['G1 (〜る)','おわる (finish)','おわらない'],
          ['G2','たべる (eat)','たべない'],
          ['G2','みる (see)','みない'],
          ['G3','する (do)','しない'],
          ['G3','くる (come)','こない'],
          ['⚠️ Special','ある (exist-non-living)','ない (NOT あらない!)'],
        ],
        examples:[
          {jp:'きょうは がっこうへ いかない。',rom:'Kyou wa gakkou e ikanai.',en:'I\'m not going to school today. (casual)'},
          {jp:'それを たべないでください。',rom:'Sore o tabenaide kudasai.',en:'Please don\'t eat that.'},
          {jp:'おかねが ない。',rom:'Okane ga nai.',en:'I have no money.'},
        ],
        badge:'g1',
        extraNote:'The ない-form + でください = "please don\'t do". The ない-form + といけません = "must do" (double negative)'
      },
      {
        pattern:'た形 (Ta-form / たけい) — Plain past form',
        meaning:'Plain (casual) past tense: "did"',
        structure:'Same sound changes as te-form, but replace て with た (and で with だ)',
        explanation:'The ta-form is the plain past tense, used in casual speech. It follows the EXACT same pattern as the te-form — just swap て→た and で→だ. Once you know te-form, ta-form is free!',
        conjugationTable:[
          ['Group','Te-form','Ta-form (past)'],
          ['G1 (〜く)','かいて','かいた (wrote)'],
          ['G1 (〜ぐ)','およいで','およいだ (swam)'],
          ['G1 (〜す)','はなして','はなした (spoke)'],
          ['G1 (〜む/ぶ/ぬ)','のんで','のんだ (drank)'],
          ['G1 (〜つ/う/る)','まって','まった (waited)'],
          ['G2','たべて','たべた (ate)'],
          ['G2','みて','みた (saw)'],
          ['G3','して','した (did)'],
          ['G3','きて','きた (came)'],
        ],
        examples:[
          {jp:'きのう えいがを みた。',rom:'Kinou eiga o mita.',en:'I watched a movie yesterday. (casual)'},
          {jp:'もう たべた？',rom:'Mou tabeta?',en:'Did you already eat?'},
          {jp:'友だちが きた。',rom:'Tomodachi ga kita.',en:'My friend came.'},
        ],
        badge:'g2',
        extraNote:'Ta-form + あとで = "after doing ~" | Ta-form + り〜たりします = "do things like ~ and ~"'
      },
      {
        pattern:'〜たり〜たりします', meaning:'"Do things like ~ and ~" (non-exhaustive list of actions)',
        structure:'[Verb ta-form]り [Verb ta-form]り します',
        explanation:'Use 〜たり〜たりします to list two or more representative actions, implying there are other things too. It\'s a softer, more natural alternative to listing actions with て-form.',
        examples:[
          {jp:'しゅうまつは テレビをみたり、ほんをよんだり します。',rom:'Shuumatsu wa terebi o mitari, hon o yondari shimasu.',en:'On weekends I watch TV, read books, and stuff like that.'},
          {jp:'こどものとき、うたったり、おどったりしました。',rom:'Kodomo no toki, utattari, odottari shimashita.',en:'When I was a child, I would sing, dance, and so on.'},
        ],
        extraNote:'The last verb is always します (or した for past). Use at least two 〜たり pairs.'
      },
      {
        pattern:'〜ほうがいい', meaning:'"Had better do ~" / "It\'s better to do ~" (advice)',
        structure:'[Verb た-form]ほうがいいです / [Verb ない-form]ほうがいいです',
        explanation:'Use 〜ほうがいい to give advice or recommendations. Positive advice (should do): use た-form. Negative advice (shouldn\'t do): use ない-form + ほうがいい.',
        examples:[
          {jp:'もっと ねたほうが いいですよ。',rom:'Motto neta hou ga ii desu yo.',en:'You had better sleep more.'},
          {jp:'タバコを すわない ほうが いいです。',rom:'Tabako o suwanai hou ga ii desu.',en:'You\'d better not smoke.'},
          {jp:'びょういんへ いったほうが いいですよ。',rom:'Byouin e itta hou ga ii desu yo.',en:'You should go to the hospital.'},
        ],
        extraNote:'〜ほうがいい is gentler advice. For strong obligation, use 〜なければなりません. Think of ほうがいい as "I recommend..." and なければなりません as "You must..."'
      },
      {
        pattern:'〜なければなりません / 〜なくてはいけません', meaning:'"Must do ~" / "Have to do ~"',
        structure:'[Verb ない-form] → remove い → add ければなりません',
        explanation:'Two ways to say "must". Both mean "it is not OK if I don\'t do it." なければなりません is slightly more formal. なくてはいけません is more commonly spoken.',
        examples:[
          {jp:'くすりを のまなければ なりません。',rom:'Kusuri o nomanakereba narimasen.',en:'I must take medicine.'},
          {jp:'しゅくだいを しなくては いけません。',rom:'Shukudai o shinakute wa ikemasen.',en:'I have to do my homework.'},
          {jp:'はやく おきなければ なりません。',rom:'Hayaku okinakereba narimasen.',en:'I must wake up early.'},
        ],
        extraNote:'Casual shortcut: 〜なきゃ (e.g. いかなきゃ = I gotta go!) | Opposite: 〜なくてもいいです = "don\'t have to do"'
      },
      {
        pattern:'〜たい (want to do)', meaning:'Expressing desire to do an action',
        structure:'[Masu-stem]たいです / たくないです / たかったです',
        explanation:'たい is an い-adjective meaning "want to do". Attach it to the verb stem (drop ます). It conjugates like an い-adjective: たくない (don\'t want), たかった (wanted), たくなかった (didn\'t want). Note: use が (not を) in very formal contexts, but を is commonly accepted.',
        conjugationTable:[
          ['Form','たい conjugation','Example'],
          ['Want to','〜たいです','たべたいです (I want to eat)'],
          ['Don\'t want to','〜たくないです','いきたくないです (I don\'t want to go)'],
          ['Wanted to','〜たかったです','ねたかったです (I wanted to sleep)'],
          ['Didn\'t want to','〜たくなかったです','たべたくなかったです (I didn\'t want to eat)'],
        ],
        examples:[
          {jp:'にほんへ いきたいです。',rom:'Nihon e ikitai desu.',en:'I want to go to Japan.'},
          {jp:'はやく うちへ かえりたいです。',rom:'Hayaku uchi e kaeritai desu.',en:'I want to go home soon.'},
          {jp:'きのう ねたかったです。',rom:'Kinou netakatta desu.',en:'I wanted to sleep yesterday.'},
        ],
        badge:'iadj',
        extraNote:'〜たがっています = "seems to want to" (used for 3rd person: かれは くるまを かいたがっています = He seems to want to buy a car)'
      },
    ]
  },
  {
    id:'adjectives', title:'Adjectives — い and な Types', icon:'🎨', colorClass:'cat-adjectives',
    items:[
      {
        pattern:'い-Adjectives (イ形容詞)', meaning:'Adjectives that end in い',
        structure:'[い-adj]です | [い-adj]+ Noun (no な needed)',
        explanation:'い-adjectives directly precede nouns. To conjugate: remove the final い and add the appropriate ending. They NEVER need な before a noun.',
        conjugationTable:[
          ['Form','Example: たかい (tall/expensive)','Example: おいしい (delicious)'],
          ['Plain (dict)','たかい','おいしい'],
          ['Polite affirm','たかいです','おいしいです'],
          ['Negative','たかくないです','おいしくないです'],
          ['Past affirm','たかかったです','おいしかったです'],
          ['Past negative','たかくなかったです','おいしくなかったです'],
          ['Before noun','たかいやま (tall mountain)','おいしいりょうり (delicious food)'],
          ['Adverb','たかく (highly/expensively)','おいしく (deliciously)'],
        ],
        examples:[
          {jp:'このかばんは たかいです。',rom:'Kono kaban wa takai desu.',en:'This bag is expensive.'},
          {jp:'きのうは さむくなかったです。',rom:'Kinou wa samukunakatta desu.',en:'Yesterday was not cold.'},
        ],
        badge:'iadj',
        extraNote:'⚠️ EXCEPTION: いい (good) → negative: よくない | past: よかった | NOT いくない/いかった!'
      },
      {
        pattern:'な-Adjectives (ナ形容詞)', meaning:'Adjectives that use な before nouns',
        structure:'[な-adj]な + Noun | [な-adj]です (predicate)',
        explanation:'な-adjectives require な when placed before a noun. As predicates, they use です without な. They conjugate differently from い-adjectives.',
        conjugationTable:[
          ['Form','Example: しずか (quiet)','Example: きれい (beautiful)'],
          ['Plain (dict)','しずかだ','きれいだ'],
          ['Polite affirm','しずかです','きれいです'],
          ['Negative','しずかじゃないです','きれいじゃないです'],
          ['Past affirm','しずかでした','きれいでした'],
          ['Past negative','しずかじゃなかったです','きれいじゃなかったです'],
          ['Before noun','しずかなへや (quiet room)','きれいなはな (beautiful flower)'],
          ['Adverb','しずかに (quietly)','きれいに (beautifully)'],
        ],
        examples:[
          {jp:'このへやは しずかです。',rom:'Kono heya wa shizuka desu.',en:'This room is quiet.'},
          {jp:'きれいなはなを かいました。',rom:'Kirei na hana o kaimashita.',en:'I bought beautiful flowers.'},
        ],
        badge:'naadj',
        extraNote:'Common な-adjectives: しずか(quiet)・きれい(pretty/clean)・げんき(energetic)・すき(liked)・きらい(disliked)・じょうず(good at)・へた(bad at)・たいせつ(important)・べんり(convenient)・ゆうめい(famous)'
      },
      {
        pattern:'Adjective + Noun', meaning:'Placing adjectives before nouns',
        structure:'[い-adj (no change)]Noun | [な-adj + な]Noun',
        explanation:'い-adjectives go directly before the noun. な-adjectives need な inserted between adjective and noun.',
        examples:[
          {jp:'おおきい いぬ',rom:'Ookii inu',en:'A big dog (い-adj)'},
          {jp:'しずかな まち',rom:'Shizuka na machi',en:'A quiet town (な-adj)'},
          {jp:'たかい やま',rom:'Takai yama',en:'A tall mountain (い-adj)'},
          {jp:'げんきな こども',rom:'Genki na kodomo',en:'An energetic child (な-adj)'},
        ]
      },
      {
        pattern:'〜が すきです / きらいです / じょうずです', meaning:'Like / dislike / be good at ~',
        structure:'[Noun / Verb-の]が すき/きらい/じょうず/へた です',
        explanation:'These な-adjectives use が (not を) to mark the object. すき = liked, きらい = disliked, じょうず = skilled, へた = unskilled.',
        examples:[
          {jp:'ねこが すきです。',rom:'Neko ga suki desu.',en:'I like cats.'},
          {jp:'にほんごが じょうずですね。',rom:'Nihongo ga jouzu desu ne.',en:'Your Japanese is good!'},
          {jp:'りょうりが きらいです。',rom:'Ryouri ga kirai desu.',en:'I dislike cooking.'},
        ]
      },
    ]
  },
  {
    id:'tense', title:'Tense, Time & Connectors', icon:'⏰', colorClass:'cat-tense',
    items:[
      {
        pattern:'〜ています', meaning:'Currently doing (ongoing) / habitual / state of being',
        structure:'[Verb te-form]います',
        explanation:'ています has three main uses: (1) action in progress right now, (2) habitual action, (3) resultant state. Context determines which.',
        examples:[
          {jp:'いま ほんを よんでいます。',rom:'Ima hon o yonde imasu.',en:'I am reading a book right now. (in progress)'},
          {jp:'かれは けっこんしています。',rom:'Kare wa kekkon shite imasu.',en:'He is married. (resultant state)'},
          {jp:'まいにち うんどうをしています。',rom:'Mainichi undou o shite imasu.',en:'I exercise every day. (habitual)'},
        ]
      },
      {
        pattern:'〜まえに / 〜あとで', meaning:'Before ~ / After ~',
        structure:'[Verb dict]まえに | [Verb past/Noun の]あとで',
        explanation:'まえに = before doing ~. Use dictionary form. あとで = after doing ~. Use past (た) form of the verb.',
        examples:[
          {jp:'たべるまえに てを あらいます。',rom:'Taberu mae ni te o araimasu.',en:'I wash my hands before eating.'},
          {jp:'しゅくだいを したあとで、テレビを みます。',rom:'Shukudai o shita ato de, terebi o mimasu.',en:'After doing homework, I watch TV.'},
        ]
      },
      {
        pattern:'〜から (because)', meaning:'Because / so (giving reason)',
        structure:'[Reason, plain form]から、[Result]',
        explanation:'から at the end of a clause gives the reason for the result. The reason clause uses plain form. Casual and direct.',
        examples:[
          {jp:'あめだから、うちにいます。',rom:'Ame da kara, uchi ni imasu.',en:'Because it\'s raining, I\'m staying home.'},
          {jp:'つかれたから、ねます。',rom:'Tsukareta kara, nemasu.',en:'I\'m tired, so I\'ll sleep.'},
        ]
      },
      {
        pattern:'〜ので (because — softer)', meaning:'Because (polite, softer reason)',
        structure:'[Reason]な/plain ので、[Result]',
        explanation:'ので is similar to から but more polite and indirect. Preferred in formal situations. な-adjectives and nouns need なので.',
        examples:[
          {jp:'びょうきなので、がっこうを やすみます。',rom:'Byouki na node, gakkou o yasumimasu.',en:'Because I\'m sick, I\'ll be absent from school.'},
          {jp:'いそがしいので、いけません。',rom:'Isogashii node, ikemasen.',en:'Because I\'m busy, I can\'t go.'},
        ]
      },
      {
        pattern:'〜と おもいます', meaning:'I think that ~',
        structure:'[Clause plain form]と おもいます',
        explanation:'Quote a thought or opinion using と. The clause before と uses plain (dictionary/ta/nai) form, not polite form.',
        examples:[
          {jp:'あしたは はれると おもいます。',rom:'Ashita wa hareru to omoimasu.',en:'I think it will be sunny tomorrow.'},
          {jp:'かれは がくせいだと おもいます。',rom:'Kare wa gakusei da to omoimasu.',en:'I think he is a student.'},
        ]
      },
      {
        pattern:'〜に なります', meaning:'To become ~',
        structure:'[Noun]に / [い-adj → く]なります / [な-adj]に なります',
        explanation:'なります means "become". い-adjectives: drop い → add く + なります. な-adjectives and nouns: add に + なります.',
        examples:[
          {jp:'はるに なります。',rom:'Haru ni narimasu.',en:'It becomes spring.'},
          {jp:'にほんごが じょうずに なりたいです。',rom:'Nihongo ga jouzu ni naritai desu.',en:'I want to become good at Japanese.'},
          {jp:'あたたかくなりました。',rom:'Atatakaku narimashita.',en:'It has become warm.'},
        ]
      },
    ]
  },
  {
    id:'expressions', title:'Useful Expressions & Patterns', icon:'💬', colorClass:'cat-expressions',
    items:[
      {
        pattern:'〜てください / 〜ないでください', meaning:'Please do ~ / Please don\'t do ~',
        structure:'[Te-form]ください | [Nai-form]ないでください',
        explanation:'Polite requests. てください = please do. ないでください = please don\'t. ください alone means "please give me".',
        examples:[
          {jp:'みてください。',rom:'Mite kudasai.',en:'Please look.'},
          {jp:'たばこを すわないでください。',rom:'Tabako o suwanaide kudasai.',en:'Please don\'t smoke.'},
          {jp:'もういちど いってください。',rom:'Mou ichido itte kudasai.',en:'Please say it one more time.'},
        ]
      },
      {
        pattern:'〜ね / 〜よ / 〜よね', meaning:'Seeking agreement / Emphasis / Confirming',
        structure:'Sentence + ね/よ/よね',
        explanation:'ね seeks confirmation or softens statements ("isn\'t it?"). よ asserts/emphasizes information the listener may not know. よね combines both.',
        examples:[
          {jp:'きょうは さむいですね。',rom:'Kyou wa samui desu ne.',en:'It\'s cold today, isn\'t it.'},
          {jp:'これは おいしいですよ。',rom:'Kore wa oishii desu yo.',en:'This is delicious, I tell you!'},
          {jp:'でんしゃは べんりですよね。',rom:'Densha wa benri desu yo ne.',en:'Trains are convenient, right?'},
        ]
      },
      {
        pattern:'〜でしょう', meaning:'Probably / I suppose',
        structure:'[Plain form / Noun / な-adj]でしょう',
        explanation:'でしょう expresses a guess or probability based on evidence or reasoning. Like "I suppose" or "probably".',
        examples:[
          {jp:'あしたは あめでしょう。',rom:'Ashita wa ame deshou.',en:'Tomorrow it will probably rain.'},
          {jp:'かれは にほんじんでしょう。',rom:'Kare wa nihonjin deshou.',en:'He\'s probably Japanese.'},
        ]
      },
      {
        pattern:'どんな〜 / どの〜 / どれ', meaning:'What kind of / Which (of group) / Which one',
        structure:'どんな+Noun | どの+Noun | どれ (alone)',
        explanation:'どんな asks about the nature/type. どの selects from a known group. どれ asks "which one" without a noun.',
        examples:[
          {jp:'どんな おんがくが すきですか。',rom:'Donna ongaku ga suki desu ka?',en:'What kind of music do you like?'},
          {jp:'どのほんが あなたのですか。',rom:'Dono hon ga anata no desu ka?',en:'Which book is yours?'},
          {jp:'どれが いいですか。',rom:'Dore ga ii desu ka?',en:'Which one is good?'},
        ]
      },
      {
        pattern:'〜てもいいですか / 〜てはいけません', meaning:'May I ~? / Must not ~',
        structure:'[Te-form]もいいですか | [Te-form]はいけません',
        explanation:'Permission: 〜てもいいですか = "Is it okay if I do ~?". Prohibition: 〜てはいけません = "You must not do ~". Casual: 〜ちゃだめ.',
        examples:[
          {jp:'ここで しゃしんを とっても いいですか。',rom:'Koko de shashin o totte mo ii desu ka?',en:'May I take photos here?'},
          {jp:'ここで たべては いけません。',rom:'Koko de tabete wa ikemasen.',en:'You must not eat here.'},
        ]
      },
      {
        pattern:'〜は どうですか', meaning:'How about ~? / How is ~?',
        structure:'[Noun / Verb-の]は どうですか',
        explanation:'Used to make suggestions or ask for opinions/reactions.',
        examples:[
          {jp:'おちゃは どうですか。',rom:'Ocha wa dou desu ka?',en:'How about some tea?'},
          {jp:'あたらしい しごとは どうですか。',rom:'Atarashii shigoto wa dou desu ka?',en:'How is the new job?'},
        ]
      },
      {
        pattern:'〜は〜より〜です', meaning:'~ is more ~ than ~ (comparison)',
        structure:'[A]は [B]より [adjective]です',
        explanation:'より means "than" in comparisons. Put the thing being compared to after より. To ask which is more: どちらの ほうが〜ですか.',
        examples:[
          {jp:'にほんごは えいごより むずかしいです。',rom:'Nihongo wa eigo yori muzukashii desu.',en:'Japanese is more difficult than English.'},
          {jp:'ねこは いぬより すきです。',rom:'Neko wa inu yori suki desu.',en:'I like cats more than dogs.'},
          {jp:'どちらのほうが たかいですか。',rom:'Dochira no hou ga takai desu ka?',en:'Which one is more expensive?'},
        ],
        extraNote:'Most ~ in a group: 〜の なかで いちばん〜です (e.g. クラスで いちばん はやいです = fastest in the class)'
      },
      {
        pattern:'〜の なかで いちばん〜', meaning:'"The most ~ among ~" (superlative)',
        structure:'[Group]の なかで いちばん [adjective]です',
        explanation:'いちばん means "number one / most". Use it to express superlatives. The group/category uses の なかで.',
        examples:[
          {jp:'くだものの なかで りんごが いちばん すきです。',rom:'Kudamono no naka de ringo ga ichiban suki desu.',en:'Among fruits, I like apples the most.'},
          {jp:'クラスで いちばん せが たかいです。',rom:'Kurasu de ichiban se ga takai desu.',en:'I am the tallest in the class.'},
        ]
      },
      {
        pattern:'感情・感想 adjectives (おもしろい etc.)',
        meaning:'Feelings and impressions expressed with い-adjectives',
        structure:'[い-adj feeling]です / [い-adj feeling]と おもいます',
        explanation:'Many feelings in Japanese are い-adjectives. They describe how something feels or strikes you. These are extremely common in everyday speech and in the N5 exam.',
        conjugationTable:[
          ['Japanese','Reading','Meaning'],
          ['おもしろい','omoshiroi','interesting / funny'],
          ['たのしい','tanoshii','fun / enjoyable'],
          ['うれしい','ureshii','happy / glad'],
          ['かなしい','kanashii','sad'],
          ['こわい','kowai','scary'],
          ['はずかしい','hazukashii','embarrassing / shy'],
          ['むずかしい','muzukashii','difficult'],
          ['やさしい','yasashii','easy / kind'],
          ['いそがしい','isogashii','busy'],
          ['つまらない','tsumaranai','boring'],
          ['すごい','sugoi','amazing / incredible'],
          ['かわいい','kawaii','cute'],
          ['おいしい','oishii','delicious'],
          ['まずい','mazui','bad tasting'],
        ],
        examples:[
          {jp:'このえいがは おもしろかったです。',rom:'Kono eiga wa omoshirokatta desu.',en:'This movie was interesting.'},
          {jp:'パーティーは たのしかったです。',rom:'Paatii wa tanoshikatta desu.',en:'The party was fun.'},
          {jp:'しけんが こわいです。',rom:'Shiken ga kowai desu.',en:'I\'m scared of the exam.'},
        ],
        badge:'iadj'
      },
      {
        pattern:'〜がほしい / ほしくない', meaning:'"Want (a thing)" (desire for noun)',
        structure:'[Noun]が ほしいです / ほしくないです',
        explanation:'ほしい means "want" for NOUNS (things). It is an い-adjective. Do NOT confuse with たい which is for verbs (wanting to DO something). ほしい uses が to mark what is wanted.',
        examples:[
          {jp:'あたらしい パソコンが ほしいです。',rom:'Atarashii pasokon ga hoshii desu.',en:'I want a new computer.'},
          {jp:'おかねが ほしくないです。',rom:'Okane ga hoshikunai desu.',en:'I don\'t want money.'},
          {jp:'なにが ほしいですか。',rom:'Nani ga hoshii desu ka?',en:'What do you want?'},
        ],
        badge:'iadj',
        extraNote:'ほしい = want a THING | たい = want to DO something. "水が ほしい" (want water) vs "水を のみたい" (want to drink water)'
      },
      {
        pattern:'〜そうです (looks like / seems)', meaning:'It looks/seems ~ (based on appearance)',
        structure:'[い-adj remove い / な-adj]そうです | [Verb masu-stem]そうです',
        explanation:'そうです attached to an adjective or verb stem expresses that something looks or seems a certain way based on visual evidence. Different from 〜そうです for hearsay (with plain form).',
        examples:[
          {jp:'このケーキは おいしそうです。',rom:'Kono keeki wa oishisou desu.',en:'This cake looks delicious.'},
          {jp:'かれは いそがしそうです。',rom:'Kare wa isogashisou desu.',en:'He looks busy.'},
          {jp:'あめが ふりそうです。',rom:'Ame ga furisou desu.',en:'It looks like it\'s going to rain.'},
        ],
        extraNote:'⚠️ いい → よさそう (looks good) | ない → なさそう (looks like there isn\'t)'
      },
      {
        pattern:'〜でしょう / 〜かもしれません', meaning:'Probably ~ / Might ~ (degrees of certainty)',
        structure:'[Plain form]でしょう | [Plain form]かもしれません',
        explanation:'でしょう = fairly confident guess (~70%). かもしれません = possibility, less certain (~50%). Both follow the plain form.',
        examples:[
          {jp:'あしたは あめでしょう。',rom:'Ashita wa ame deshou.',en:'It will probably rain tomorrow.'},
          {jp:'かれは にほんじんかも しれません。',rom:'Kare wa nihonjin kamo shiremasen.',en:'He might be Japanese.'},
          {jp:'きょうは むずかしいかも しれません。',rom:'Kyou wa muzukashii kamo shiremasen.',en:'Today might be difficult.'},
        ]
      },
    ]
  }
];
