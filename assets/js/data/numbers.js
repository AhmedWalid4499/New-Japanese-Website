// Numbers, time, dates, money + the numbers quiz.
// Plain data — edit freely. Loaded as a classic script, so these consts are global.

const NUM_BASICS = [
  {n:'0',jp:'ぜろ／れい',rom:'zero / rei'},{n:'1',jp:'いち',rom:'ichi'},{n:'2',jp:'に',rom:'ni'},
  {n:'3',jp:'さん',rom:'san'},{n:'4',jp:'し／よん',rom:'shi / yon'},{n:'5',jp:'ご',rom:'go'},
  {n:'6',jp:'ろく',rom:'roku'},{n:'7',jp:'しち／なな',rom:'shichi / nana'},{n:'8',jp:'はち',rom:'hachi'},
  {n:'9',jp:'きゅう／く',rom:'kyuu / ku'},{n:'10',jp:'じゅう',rom:'juu'},{n:'11',jp:'じゅういち',rom:'juuichi'},
  {n:'20',jp:'にじゅう',rom:'nijuu'},{n:'30',jp:'さんじゅう',rom:'sanjuu'},{n:'40',jp:'よんじゅう',rom:'yonjuu'},
  {n:'100',jp:'ひゃく',rom:'hyaku'},{n:'200',jp:'にひゃく',rom:'nihyaku'},{n:'300',jp:'さんびゃく',rom:'sanbyaku'},
  {n:'600',jp:'ろっぴゃく',rom:'roppyaku'},{n:'800',jp:'はっぴゃく',rom:'happyaku'},
  {n:'1,000',jp:'せん',rom:'sen'},{n:'3,000',jp:'さんぜん',rom:'sanzen'},{n:'8,000',jp:'はっせん',rom:'hassen'},
  {n:'10,000',jp:'いちまん',rom:'ichiman'},
];

const NUM_TIME = [
  {label:'1:00',jp:'いちじ',rom:'ichi-ji'},{label:'2:00',jp:'にじ',rom:'ni-ji'},{label:'3:00',jp:'さんじ',rom:'san-ji'},
  {label:'4:00',jp:'よじ',rom:'yo-ji'},{label:'5:00',jp:'ごじ',rom:'go-ji'},{label:'6:00',jp:'ろくじ',rom:'roku-ji'},
  {label:'7:00',jp:'しちじ',rom:'shichi-ji'},{label:'8:00',jp:'はちじ',rom:'hachi-ji'},{label:'9:00',jp:'くじ',rom:'ku-ji'},
  {label:'10:00',jp:'じゅうじ',rom:'juu-ji'},{label:'11:00',jp:'じゅういちじ',rom:'juuichi-ji'},{label:'12:00',jp:'じゅうにじ',rom:'juuni-ji'},
  {label:'Half past',jp:'〜じはん',rom:'~ji han'},{label:'30 min',jp:'さんじっぷん',rom:'sanjuppun'},
  {label:'AM',jp:'ごぜん',rom:'gozen'},{label:'PM',jp:'ごご',rom:'gogo'},
  {label:'What time?',jp:'なんじですか',rom:'nanji desu ka?'},{label:'Now',jp:'いま',rom:'ima'},
];

const NUM_DATES = [
  {label:'1st',jp:'ついたち',rom:'tsuitachi'},{label:'2nd',jp:'ふつか',rom:'futsuka'},{label:'3rd',jp:'みっか',rom:'mikka'},
  {label:'4th',jp:'よっか',rom:'yokka'},{label:'5th',jp:'いつか',rom:'itsuka'},{label:'6th',jp:'むいか',rom:'muika'},
  {label:'7th',jp:'なのか',rom:'nanoka'},{label:'8th',jp:'ようか',rom:'youka'},{label:'9th',jp:'ここのか',rom:'kokonoka'},
  {label:'10th',jp:'とおか',rom:'tooka'},{label:'14th',jp:'じゅうよっか',rom:'juuyokka'},{label:'20th',jp:'はつか',rom:'hatsuka'},
  {label:'Jan',jp:'いちがつ',rom:'ichi-gatsu'},{label:'Feb',jp:'にがつ',rom:'ni-gatsu'},
  {label:'Mar',jp:'さんがつ',rom:'san-gatsu'},{label:'Apr',jp:'しがつ',rom:'shi-gatsu'},
  {label:'May',jp:'ごがつ',rom:'go-gatsu'},{label:'Jun',jp:'ろくがつ',rom:'roku-gatsu'},
  {label:'Jul',jp:'しちがつ',rom:'shichi-gatsu'},{label:'Aug',jp:'はちがつ',rom:'hachi-gatsu'},
  {label:'Sep',jp:'くがつ',rom:'ku-gatsu'},{label:'Oct',jp:'じゅうがつ',rom:'juu-gatsu'},
  {label:'Nov',jp:'じゅういちがつ',rom:'juuichi-gatsu'},{label:'Dec',jp:'じゅうにがつ',rom:'juuni-gatsu'},
];

const NUM_MONEY = [
  {label:'¥100',jp:'ひゃくえん',rom:'hyaku-en'},{label:'¥500',jp:'ごひゃくえん',rom:'gohyaku-en'},
  {label:'¥1,000',jp:'せんえん',rom:'sen-en'},{label:'¥1,500',jp:'せんごひゃくえん',rom:'sengohyaku-en'},
  {label:'¥2,000',jp:'にせんえん',rom:'nisen-en'},{label:'¥3,800',jp:'さんぜんはっぴゃくえん',rom:'sanzenhappyaku-en'},
  {label:'¥5,000',jp:'ごせんえん',rom:'gosen-en'},{label:'¥10,000',jp:'いちまんえん',rom:'ichiman-en'},
  {label:'How much?',jp:'いくらですか',rom:'ikura desu ka?'},{label:'Cheap',jp:'やすい',rom:'yasui'},
  {label:'Expensive',jp:'たかい',rom:'takai'},{label:'Change',jp:'おつり',rom:'otsuri'},
  {label:'Receipt',jp:'レシート',rom:'reshiito'},{label:'Tax incl.',jp:'ぜいこみ',rom:'zeikomi'},
];

const NUM_QUIZ_Q = [
  {q:'How do you say 14?',opts:['じゅうし','しじゅう','よんじゅう','ひゃくよん'],ans:0},
  {q:'What number is さんびゃく?',opts:['30','3,000','300','3'],ans:2},
  {q:'How do you say 4 o\'clock?',opts:['しじ','よじ','よんじ','しちじ'],ans:1},
  {q:'What is the 20th of the month?',opts:['にじゅうにち','はつか','にじゅうか','ふつか'],ans:1},
  {q:'How do you say ¥1,500?',opts:['いちせんごひゃくえん','せんごひゃくえん','いちまんごひゃくえん','ごひゃくせんえん'],ans:1},
  {q:'What is じゅういちじ?',opts:['10:00','12:00','11:00','1:00'],ans:2},
  {q:'How do you say March?',opts:['さんがつ','みつき','さんげつ','みがつ'],ans:0},
  {q:'What does ごぜん mean?',opts:['PM','AM','evening','noon'],ans:1},
  {q:'How do you say the 2nd?',opts:['ふたにち','にか','ふつか','にちめ'],ans:2},
  {q:'What is まん (万)?',opts:['1,000','100','100,000','10,000'],ans:3},
  {q:'How do you say half past?',opts:['はんじ','じはん','はんぷん','じゅう'],ans:1},
  {q:'What is ¥800 in Japanese?',opts:['はちえん','はちじゅうえん','はっぴゃくえん','はちひゃくえん'],ans:2},
];

// Extra reference tables shown under each numbers tab: [japanese, meaning] or [label, japanese, romaji]
const NUM_SOUND_CHANGES = [
  ['300','さんびゃく','ひゃく → びゃく after さん'],
  ['600','ろっぴゃく','ひゃく → ぴゃく after ろく'],
  ['800','はっぴゃく','ひゃく → ぴゃく after はち'],
  ['3,000','さんぜん','せん → ぜん after さん'],
  ['8,000','はっせん','Double consonant'],
];
const NUM_TIME_EXAMPLES = [
  ['ごぜん くじ','9:00 AM'],['ごご さんじはん','3:30 PM'],['じゅうにじ じゅうごふん','12:15'],
  ['いまなんじですか？','What time is it?'],['よじに あいましょう','Let\'s meet at 4:00'],['ごじまで べんきょうします','I study until 5:00'],
];
const NUM_IRREGULAR_DAYS = [
  ['1st','ついたち','tsuitachi'],['2nd','ふつか','futsuka'],['3rd','みっか','mikka'],['4th','よっか','yokka'],
  ['8th','ようか','youka'],['9th','ここのか','kokonoka'],['10th','とおか','tooka'],['14th','じゅうよっか','juuyokka'],
  ['20th','はつか','hatsuka'],['24th','にじゅうよっか','nijuuyokka'],
];
const NUM_SHOPPING = [
  ['これはいくらですか？','How much is this?'],['___をください','Please give me ___'],['たかいですね','That\'s expensive, isn\'t it'],
  ['やすくなりませんか？','Can it be cheaper?'],['クレジットカードはつかえますか？','Can I use a credit card?'],
  ['レシートをください','Please give me a receipt'],['べつべつにおねがいします','Separate bills please'],
];
