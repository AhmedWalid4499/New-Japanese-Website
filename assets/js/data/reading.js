// Reading passages with comprehension questions.
// Plain data — edit freely. Loaded as a classic script, so these consts are global.

const READING_TESTS=[
  {
    title:'田中さんの一日',
    passage:'たなかさんは まいあさ 七時に おきます。あさごはんを たべて、がっこうへ いきます。がっこうは 九時から 三時まで です。ひるごはんは がっこうで たべます。うちへ かえってから、べんきょうします。よる 十一時に ねます。',
    passageRom:'Tanaka-san wakes up at 7 every morning. She eats breakfast and goes to school. School is from 9 to 3. She eats lunch at school. After returning home she studies. She sleeps at 11.',
    questions:[
      {q:'What time does Tanaka-san wake up?',opts:['6 o\'clock','7 o\'clock','8 o\'clock','9 o\'clock'],ans:1},
      {q:'Where does she eat lunch?',opts:['At home','At a restaurant','At school','At the station'],ans:2},
      {q:'What does she do after returning home?',opts:['Watches TV','Eats dinner','Studies','Sleeps'],ans:2},
      {q:'What time does she sleep?',opts:['9 o\'clock','10 o\'clock','11 o\'clock','12 o\'clock'],ans:2},
    ]
  },
  {
    title:'かわいいカフェ',
    passage:'これは かわいい カフェです。カフェに テーブルが 五つ あります。コーヒーと おちゃと ケーキが あります。コーヒーは 三百円です。おちゃは 二百円です。ケーキは 四百円です。いつも にぎやかです。',
    passageRom:'This is a cute café. There are 5 tables. Coffee, tea and cake are available. Coffee is ¥300, tea ¥200, cake ¥400. It\'s always lively.',
    questions:[
      {q:'How many tables are in the café?',opts:['3','4','5','6'],ans:2},
      {q:'How much is the coffee?',opts:['200 yen','300 yen','400 yen','500 yen'],ans:1},
      {q:'Which is cheapest?',opts:['Coffee','Tea','Cake','Juice'],ans:1},
      {q:'How is the café described?',opts:['Quiet','Empty','Lively','Small'],ans:2},
    ]
  },
  {
    title:'やまだくんの しゅみ',
    passage:'やまださんの しゅみは おんがくを きくことです。まいにち 学校から かえってから、一時間 おんがくを ききます。すきな おんがくは ジャズです。ロックも すきですが、クラシックは あまり すきじゃないです。',
    passageRom:'Yamada\'s hobby is listening to music. Every day after returning from school, he listens to music for one hour. His favourite genre is jazz. He also likes rock, but doesn\'t really like classical.',
    questions:[
      {q:'What is Yamada\'s hobby?',opts:['Playing sports','Listening to music','Reading books','Cooking'],ans:1},
      {q:'How long does he listen to music each day?',opts:['30 minutes','1 hour','2 hours','3 hours'],ans:1},
      {q:'What is his favourite kind of music?',opts:['Rock','Classical','Jazz','Pop'],ans:2},
      {q:'How does he feel about classical music?',opts:['Loves it','Doesn\'t really like it','Hates it','Doesn\'t know it'],ans:1},
    ]
  },
  {
    title:'スーパーで',
    passage:'きょう、おかあさんと スーパーへ いきました。りんごと バナナと ぎゅうにゅうを かいました。りんごは 百円でした。バナナは 二百円でした。ぎゅうにゅうは 百五十円でした。ぜんぶで 四百五十円 はらいました。',
    passageRom:'Today I went to the supermarket with my mother. We bought apples, bananas and milk. Apples were ¥100, bananas ¥200, milk ¥150. We paid ¥450 in total.',
    questions:[
      {q:'Who did the speaker go shopping with?',opts:['Father','Mother','Friend','Teacher'],ans:1},
      {q:'What did they NOT buy?',opts:['Apples','Bananas','Milk','Eggs'],ans:3},
      {q:'How much were the bananas?',opts:['100 yen','150 yen','200 yen','250 yen'],ans:2},
      {q:'How much did they pay in total?',opts:['350 yen','400 yen','450 yen','500 yen'],ans:2},
    ]
  },
  {
    title:'はるのてがみ',
    passage:'はるに なりました。きょうは てんきが いいです。そらは あおくて、はなが きれいです。こうえんに こどもたちが います。こどもたちは たのしそうです。わたしも こうえんへ いきたいです。',
    passageRom:'Spring has come. Today the weather is nice. The sky is blue and the flowers are pretty. There are children in the park. The children look like they\'re having fun. I want to go to the park too.',
    questions:[
      {q:'What season is it?',opts:['Summer','Autumn','Winter','Spring'],ans:3},
      {q:'How is the weather described?',opts:['Rainy','Windy','Nice/fine','Cloudy'],ans:2},
      {q:'Who is in the park?',opts:['Teachers','Dogs','Children','Friends'],ans:2},
      {q:'What does the writer want to do?',opts:['Go to school','Go to the park','Buy flowers','Meet friends'],ans:1},
    ]
  },
];

const COMP_PASSAGES = [
  // DAILY LIFE
  {
    id:'c1', cat:'daily', diff:'beginner', title:'わたしの いちにち', titleEn:'My Day',
    passage:'わたしは まいにち ろくじに おきます。あさごはんを たべてから、がっこうへ いきます。がっこうは くじに はじまります。ひるごはんは ともだちと たべます。ごごさんじに うちに かえります。そして しゅくだいを します。よるは かぞくと ばんごはんを たべます。じゅうじごろ ねます。',
    passageEn:'Every day I wake up at 6 o\'clock. After eating breakfast, I go to school. School starts at 9 o\'clock. I eat lunch with my friends. I go home at 3 in the afternoon. Then I do homework. In the evening I eat dinner with my family. I go to sleep around 10 o\'clock.',
    questions:[
      {q:'なんじに おきますか？',opts:['しちじ','ろくじ','はちじ','ごじ'],ans:1,exp:'まいにち ろくじに おきます'},
      {q:'ひるごはんは だれと たべますか？',opts:['かぞくと','ひとりで','せんせいと','ともだちと'],ans:3,exp:'ともだちと たべます'},
      {q:'うちに かえるのは なんじですか？',opts:['にじ','ごじ','さんじ','よじ'],ans:2,exp:'ごごさんじに うちに かえります'},
      {q:'よるは だれと ばんごはんを たべますか？',opts:['ともだち','ひとり','かぞく','せんせい'],ans:2,exp:'かぞくと ばんごはんを たべます'},
      {q:'なんじごろ ねますか？',opts:['はちじ','くじ','じゅういちじ','じゅうじ'],ans:3,exp:'じゅうじごろ ねます'},
    ]
  },
  {
    id:'c2', cat:'daily', diff:'beginner', title:'わたしの へや', titleEn:'My Room',
    passage:'わたしの へやは ちいさいですが、きれいです。つくえの うえに パソコンと ほんが あります。まどの そばに ベッドが あります。かべに にほんごの ポスターが はって あります。へやに テレビは ありません。でも、スマートフォンで よく どうがを みます。わたしは じぶんの へやが すきです。',
    passageEn:'My room is small but clean. On the desk there is a computer and books. Near the window there is a bed. On the wall a Japanese poster is hung. There is no TV in the room. But I often watch videos on my smartphone. I like my own room.',
    questions:[
      {q:'へやは どうですか？',opts:['おおきくて きれい','ちいさくて きれい','きたなくて おおきい','ちいさくて きたない'],ans:1,exp:'ちいさいですが、きれいです'},
      {q:'つくえの うえに なにが ありますか？',opts:['テレビと ほん','パソコンと ほん','ベッドと ポスター','スマートフォン'],ans:1,exp:'パソコンと ほんが あります'},
      {q:'ベッドは どこに ありますか？',opts:['つくえの そば','かべの そば','まどの そば','ドアの そば'],ans:2,exp:'まどの そばに あります'},
      {q:'へやに テレビは ありますか？',opts:['はい、あります','いいえ、ありません','ちいさい テレビが あります','かべに あります'],ans:1,exp:'テレビは ありません'},
      {q:'どうがは どうやって みますか？',opts:['テレビで','パソコンで','スマートフォンで','えいがかんで'],ans:2,exp:'スマートフォンで どうがを みます'},
    ]
  },
  {
    id:'c3', cat:'daily', diff:'intermediate', title:'あさの ルーティン', titleEn:'Morning Routine',
    passage:'たなかさんは まいあさ しちじに おきます。まず、かおを あらいます。それから、シャワーを あびます。あさごはんは パンと コーヒーです。はみがきを してから、きがえます。がっこうへは でんしゃで いきます。えきまで あるいて じゅっぷんです。でんしゃは はっぷんで がっこうの ちかくの えきに つきます。たなかさんは まいあさ はちじごろ がっこうに つきます。',
    passageEn:'Tanaka-san wakes up at 7am every morning. First she washes her face. Then she takes a shower. Breakfast is bread and coffee. After brushing her teeth, she gets dressed. She goes to school by train. It is 10 minutes walking to the station. The train takes 8 minutes to arrive at the station near school. Tanaka-san arrives at school around 8am every morning.',
    questions:[
      {q:'たなかさんは なんじに おきますか？',opts:['ろくじ','しちじ','はちじ','くじ'],ans:1,exp:'まいあさ しちじに おきます'},
      {q:'あさごはんは なんですか？',opts:['ごはんと みそしる','パンと コーヒー','たまごと パン','コーヒーと おかし'],ans:1,exp:'パンと コーヒーです'},
      {q:'がっこうへ どうやって いきますか？',opts:['バスで','くるまで','でんしゃで','あるいて'],ans:2,exp:'でんしゃで いきます'},
      {q:'えきまで どのくらい かかりますか？',opts:['ごふん','じゅっぷん','はっぷん','じゅうごふん'],ans:1,exp:'あるいて じゅっぷんです'},
      {q:'たなかさんは なんじごろ がっこうに つきますか？',opts:['しちじ','はちじ','くじ','ろくじ'],ans:1,exp:'はちじごろ がっこうに つきます'},
    ]
  },
  // SCHOOL
  {
    id:'c4', cat:'school', diff:'beginner', title:'がっこうの きょうしつ', titleEn:'The Classroom',
    passage:'わたしの きょうしつは にかいに あります。きょうしつに は つくえが さんじゅっこ あります。まえに おおきい こくばんが あります。せんせいの つくえは まどの そばに あります。きょうしつの かべに せかいちずと にほんの ちずが あります。まいにち にほんごと すうがくと えいごを べんきょうします。',
    passageEn:'My classroom is on the second floor. In the classroom there are 30 desks. At the front there is a large blackboard. The teacher\'s desk is near the window. On the classroom wall there are a world map and a map of Japan. Every day I study Japanese, math, and English.',
    questions:[
      {q:'きょうしつは なんかいですか？',opts:['いっかい','にかい','さんかい','よんかい'],ans:1,exp:'にかいに あります'},
      {q:'つくえは いくつ ありますか？',opts:['にじゅっこ','さんじゅっこ','よんじゅっこ','じゅっこ'],ans:1,exp:'さんじゅっこ あります'},
      {q:'せんせいの つくえは どこですか？',opts:['ドアの そば','まどの そば','こくばんの そば','うしろ'],ans:1,exp:'まどの そばに あります'},
      {q:'かべに なにが ありますか？',opts:['にほんごの ポスター','せかいちずと にほんの ちず','えいごの ほん','カレンダー'],ans:1,exp:'せかいちずと にほんの ちずが あります'},
      {q:'まいにち なにを べんきょうしますか？',opts:['にほんごだけ','えいごと すうがく','にほんごと すうがくと えいご','かがくと れきし'],ans:2,exp:'にほんごと すうがくと えいごを べんきょうします'},
    ]
  },
  {
    id:'c5', cat:'school', diff:'intermediate', title:'がっこうの しょくどう', titleEn:'The School Cafeteria',
    passage:'うちの がっこうに おおきい しょくどうが あります。ひるやすみは じゅうにじから いちじまでです。しょくどうには たくさんの りょうりが あります。きょうの ランチは カレーライスと サラダと みそしるです。カレーライスは さんびゃくえんです。わたしは まいにち しょくどうで ひるごはんを たべます。ともだちの さとうさんは おべんとうを もってきます。ふたりで いつも いっしょに たべます。',
    passageEn:'Our school has a large cafeteria. Lunch break is from 12 o\'clock to 1 o\'clock. There are many dishes in the cafeteria. Today\'s lunch is curry rice, salad, and miso soup. Curry rice is 300 yen. I eat lunch in the cafeteria every day. My friend Sato-san brings a bento box. We always eat together, the two of us.',
    questions:[
      {q:'ひるやすみは なんじから なんじまでですか？',opts:['じゅういちじから じゅうにじ','じゅうにじから いちじ','いちじから にじ','じゅうじから じゅういちじ'],ans:1,exp:'じゅうにじから いちじまでです'},
      {q:'きょうの ランチは なんですか？',opts:['カレーライスと みそしる','ラーメンと サラダ','カレーライスと サラダと みそしる','すしと みそしる'],ans:2,exp:'カレーライスと サラダと みそしるです'},
      {q:'カレーライスは いくらですか？',opts:['にひゃくえん','さんびゃくえん','ごひゃくえん','ひゃくえん'],ans:1,exp:'さんびゃくえんです'},
      {q:'さとうさんは どこで ひるごはんを たべますか？',opts:['しょくどうで','きょうしつで','こうえんで','うちで'],ans:1,exp:'さとうさんは おべんとうを もってきます。ふたりで いっしょに たべます'},
      {q:'ふたりは どうやって たべますか？',opts:['べつべつに','はやく','いっしょに','しずかに'],ans:2,exp:'ふたりで いつも いっしょに たべます'},
    ]
  },
  // TRAVEL
  {
    id:'c6', cat:'travel', diff:'intermediate', title:'とうきょうの りょこう', titleEn:'Trip to Tokyo',
    passage:'せんしゅう、かぞくと とうきょうへ いきました。しんかんせんで いきました。しんかんせんは とても はやくて、きれいでした。とうきょうでは、あさくさじんじゃと しんじゅくを みました。あさくさじんじゃは むかしの たてものが たくさんあって、すてきでした。しんじゅくは おみせが おおくて、にぎやかでした。ホテルは えきの ちかくで、べんりでした。みっかかん とうきょうに いました。またいきたいです。',
    passageEn:'Last week I went to Tokyo with my family. We went by Shinkansen. The Shinkansen was very fast and clean. In Tokyo we saw Asakusa Shrine and Shinjuku. Asakusa Shrine had many old buildings and was wonderful. Shinjuku had many shops and was lively. The hotel was near the station and was convenient. We were in Tokyo for three days. I want to go again.',
    questions:[
      {q:'いつ とうきょうへ いきましたか？',opts:['きょねん','せんしゅう','らいしゅう','きのう'],ans:1,exp:'せんしゅう、かぞくと いきました'},
      {q:'どうやって とうきょうへ いきましたか？',opts:['ひこうきで','くるまで','しんかんせんで','バスで'],ans:2,exp:'しんかんせんで いきました'},
      {q:'あさくさじんじゃは どうでしたか？',opts:['にぎやかだった','むかしの たてものが おおかった','あたらしかった','ちいさかった'],ans:1,exp:'むかしの たてものが たくさんあって、すてきでした'},
      {q:'ホテルは どこに ありましたか？',opts:['えきの そば','こうえんの そば','しんじゅくの なか','あさくさじんじゃの そば'],ans:0,exp:'えきの ちかくで、べんりでした'},
      {q:'なんにちかん とうきょうに いましたか？',opts:['ふつかかん','みっかかん','いっかかん','よっかかん'],ans:1,exp:'みっかかん とうきょうに いました'},
    ]
  },
  {
    id:'c7', cat:'travel', diff:'intermediate', title:'えきで', titleEn:'At the Station',
    passage:'やまださんは えきに きました。きっぷを かいたいですが、どこで かうか わかりません。えきいんに ききました。「すみません、おおさかまでの きっぷは どこで かえますか？」えきいんは「じどうはんばいきで かえます。あちらです」と おしえてくれました。じどうはんばいきは えきの いりぐちの そばに ありました。きっぷは にせんえんでした。やまださんは きっぷを かって、なんばんせんか かくにんしました。でんしゃは あと じゅっぷんで きます。',
    passageEn:'Yamada-san came to the station. He wants to buy a ticket but doesn\'t know where to buy one. He asked a station employee. "Excuse me, where can I buy a ticket to Osaka?" The employee told him "You can buy it at the vending machine. It\'s over there." The vending machine was near the station entrance. The ticket was 2000 yen. Yamada-san bought the ticket and confirmed which platform number. The train comes in 10 more minutes.',
    questions:[
      {q:'やまださんは なにを したいですか？',opts:['でんしゃに のりたい','きっぷを かいたい','えきいんに あいたい','おおさかへ いきたい'],ans:1,exp:'きっぷを かいたいですが、どこで かうか わかりません'},
      {q:'えきいんは なんと いいましたか？',opts:['みどりの まどぐちで かえます','じどうはんばいきで かえます','インターネットで かえます','コンビニで かえます'],ans:1,exp:'じどうはんばいきで かえます'},
      {q:'きっぷは いくらでしたか？',opts:['せんえん','にせんえん','さんぜんえん','ごひゃくえん'],ans:1,exp:'きっぷは にせんえんでした'},
      {q:'じどうはんばいきは どこに ありましたか？',opts:['ホームに','えきの そとに','いりぐちの そばに','えきいんの となりに'],ans:2,exp:'えきの いりぐちの そばに ありました'},
      {q:'でんしゃは あと なんぷんで きますか？',opts:['ごふん','じゅっぷん','にじゅっぷん','さんじゅっぷん'],ans:1,exp:'でんしゃは あと じゅっぷんで きます'},
    ]
  },
  // CULTURE
  {
    id:'c8', cat:'culture', diff:'intermediate', title:'にほんの おまつり', titleEn:'Japanese Festivals',
    passage:'にほんには いろいろな おまつりが あります。なつには はなびたいかいが あります。はなびは とても きれいです。はるには さくらまつりが あります。みんなで こうえんへ いって、さくらの したで おべんとうを たべます。これを「はなみ」と いいます。にほんの まつりには、おみこしや おどりも あります。おまつりで やたいが でます。やたいでは たこやきや わたあめや りんごあめを うっています。こどもたちは やたいが だいすきです。',
    passageEn:'There are various festivals in Japan. In summer there are fireworks displays. Fireworks are very beautiful. In spring there are cherry blossom festivals. Everyone goes to the park and eats bento under the cherry blossoms. This is called "hanami". Japanese festivals also have portable shrines and dancing. Food stalls appear at festivals. At the stalls they sell takoyaki, cotton candy, and candy apples. Children love food stalls.',
    questions:[
      {q:'なつの おまつりは なんですか？',opts:['さくらまつり','はなびたいかい','はなみ','おどり'],ans:1,exp:'なつには はなびたいかいが あります'},
      {q:'「はなみ」は なんですか？',opts:['はなびを みること','さくらの したで たべること','おみこしを かつぐこと','やたいで かうこと'],ans:1,exp:'さくらの したで おべんとうを たべます。これを「はなみ」といいます'},
      {q:'やたいで うっていない ものは どれですか？',opts:['たこやき','わたあめ','りんごあめ','すし'],ans:3,exp:'やたいでは たこやきや わたあめや りんごあめを うっています'},
      {q:'だれが やたいが すきですか？',opts:['おとなたち','こどもたち','せんせいたち','おとしよりたち'],ans:1,exp:'こどもたちは やたいが だいすきです'},
      {q:'「おみこし」は まつりの なんですか？',opts:['たべもの','おどり','はこびもの（ポータブルシュライン）','はなび'],ans:2,exp:'おみこしや おどりも あります — おみこしはポータブルシュライン'},
    ]
  },
  {
    id:'c9', cat:'culture', diff:'advanced', title:'にほんの しょくじ マナー', titleEn:'Japanese Dining Manners',
    passage:'にほんでは、しょくじの まえに「いただきます」と いいます。これは「たべものに かんしゃする」という いみです。たべおわったら「ごちそうさまでした」と いいます。はしを つかうとき、いくつかの きそくが あります。はしを たてに ごはんに さすのは マナー いはんです。それは おそうしきの ときだけ します。また、はしから はしへ たべものを わたすのも よくないです。にほんに きたら、これらの マナーを まもりましょう。',
    passageEn:'In Japan, you say "itadakimasu" before eating. This means "giving thanks for the food". When you finish eating, you say "gochisousama deshita". There are some rules when using chopsticks. Sticking chopsticks vertically into rice is a violation of manners. That is done only at funerals. Also, passing food from chopsticks to chopsticks is also not good. When you come to Japan, let\'s follow these manners.',
    questions:[
      {q:'「いただきます」は どんな いみですか？',opts:['おなかが すいた','たべものに かんしゃする','たべおわった','おいしい'],ans:1,exp:'「たべものに かんしゃする」という いみです'},
      {q:'はしを ごはんに たてに さすのは いつ しますか？',opts:['まいにち','パーティーで','おそうしきの ときだけ','にほんで'],ans:2,exp:'おそうしきの ときだけ します'},
      {q:'よくない はしの つかいかたは どれですか？',opts:['はしで たべること','はしから はしへ わたすこと','はしを テーブルに おくこと','はしで すくうこと'],ans:1,exp:'はしから はしへ たべものを わたすのも よくないです'},
      {q:'たべおわったら なんと いいますか？',opts:['いただきます','おいしかった','ごちそうさまでした','ありがとう'],ans:2,exp:'たべおわったら「ごちそうさまでした」といいます'},
      {q:'このぶんの テーマは なんですか？',opts:['にほんの りょうり','にほんの しょくじ マナー','はしの れきし','にほんの おまつり'],ans:1,exp:'にほんの しょくじ マナーについて かいてあります'},
    ]
  },
  // NATURE
  {
    id:'c10', cat:'nature', diff:'beginner', title:'にほんの きせつ', titleEn:'Japanese Seasons',
    passage:'にほんには よっつの きせつが あります。はる、なつ、あき、ふゆです。はるは さんがつから ごがつです。さくらが さいて、きれいです。なつは ろくがつから はちがつです。あつくて、うみや プールに いきます。あきは くがつから じゅういちがつです。はが あかく なって、きれいです。ふゆは じゅうにがつから にがつです。さむくて、ゆきが ふります。わたしは あきが いちばん すきです。',
    passageEn:'Japan has four seasons: spring, summer, autumn, winter. Spring is from March to May. Cherry blossoms bloom and it\'s beautiful. Summer is from June to August. It\'s hot, and people go to the sea or pool. Autumn is from September to November. The leaves turn red and it\'s beautiful. Winter is from December to February. It\'s cold and it snows. I like autumn best.',
    questions:[
      {q:'はるは なんがつから なんがつですか？',opts:['いちがつから さんがつ','さんがつから ごがつ','ろくがつから はちがつ','くがつから じゅういちがつ'],ans:1,exp:'はるは さんがつから ごがつです'},
      {q:'なつに どこへ いきますか？',opts:['やまや こうえんに','うみや プールに','えきや デパートに','がっこうや としょかんに'],ans:1,exp:'うみや プールに いきます'},
      {q:'あきは どうなりますか？',opts:['さくらが さく','ゆきが ふる','はが あかく なる','あつく なる'],ans:2,exp:'はが あかく なって、きれいです'},
      {q:'ふゆは なんがつから なんがつですか？',opts:['くがつから じゅういちがつ','じゅうにがつから にがつ','さんがつから ごがつ','ろくがつから はちがつ'],ans:1,exp:'ふゆは じゅうにがつから にがつです'},
      {q:'わたしは どの きせつが いちばん すきですか？',opts:['はる','なつ','あき','ふゆ'],ans:2,exp:'わたしは あきが いちばん すきです'},
    ]
  },
  {
    id:'c11', cat:'nature', diff:'intermediate', title:'にほんの やまと かわ', titleEn:'Japanese Mountains and Rivers',
    passage:'にほんは やまが おおい くにです。にほんで いちばん たかい やまは ふじさんで、たかさは さんぜんななひゃくじゅうろく メートルです。まいとし おおくの ひとが ふじさんに のぼります。にほんには かわも たくさん あります。いちばん ながい かわは しなのがわです。にほんの かわは みじかくて はやいものが おおいです。かわの みずは とても きれいで、さかなが たくさん います。なつには かわで あそぶ こどもたちを よく みます。',
    passageEn:'Japan is a country with many mountains. The tallest mountain in Japan is Mt. Fuji, with a height of 3,776 metres. Many people climb Mt. Fuji every year. Japan also has many rivers. The longest river is the Shinano River. Japan\'s rivers are mostly short and fast. The river water is very clean and there are many fish. In summer you often see children playing in rivers.',
    questions:[
      {q:'にほんで いちばん たかい やまは なんですか？',opts:['くじゅうさん','ふじさん','おんたけさん','しらねさん'],ans:1,exp:'ふじさんで、たかさは さんぜんななひゃくじゅうろく メートルです'},
      {q:'ふじさんの たかさは なんメートルですか？',opts:['さんぜんろっぴゃくメートル','さんぜんななひゃくじゅうろくメートル','よんぜんメートル','にせんメートル'],ans:1,exp:'たかさは さんぜんななひゃくじゅうろくメートルです'},
      {q:'にほんの かわは どんな かわが おおいですか？',opts:['ながくて おそい','ながくて はやい','みじかくて はやい','みじかくて おそい'],ans:2,exp:'みじかくて はやいものが おおいです'},
      {q:'にほんで いちばん ながい かわは なんですか？',opts:['とねがわ','しなのがわ','よどがわ','すみだがわ'],ans:1,exp:'いちばん ながい かわは しなのがわです'},
      {q:'なつに かわで よく みるのは だれですか？',opts:['おとなたち','りょこうしゃ','こどもたち','さかな'],ans:2,exp:'なつには かわで あそぶ こどもたちを よく みます'},
    ]
  },
];
