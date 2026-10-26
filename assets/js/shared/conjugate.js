// Conjugation engine + word lists, shared by the website and the iPhone app.
// Pure functions (no DOM). Exposes window.Conj.
(function () {
  // N5 verbs: [dictionary form, english, group]  (u = Group 1, ru = Group 2, irr = Group 3)
  const VERBS = [
    ['たべる', 'to eat', 'ru'], ['みる', 'to see / watch', 'ru'], ['ねる', 'to sleep', 'ru'], ['おきる', 'to wake up', 'ru'],
    ['でかける', 'to go out', 'ru'], ['あける', 'to open', 'ru'], ['しめる', 'to close', 'ru'], ['おしえる', 'to teach', 'ru'],
    ['わすれる', 'to forget', 'ru'], ['いる', 'to be (people, animals)', 'ru'], ['きる', 'to wear (shirts)', 'ru'], ['あびる', 'to take (a shower)', 'ru'],
    ['かりる', 'to borrow', 'ru'], ['でる', 'to leave / go out', 'ru'], ['つける', 'to turn on', 'ru'], ['はじめる', 'to begin', 'ru'],
    ['いく', 'to go', 'u'], ['かう', 'to buy', 'u'], ['のむ', 'to drink', 'u'], ['よむ', 'to read', 'u'], ['かく', 'to write', 'u'],
    ['きく', 'to listen / ask', 'u'], ['はなす', 'to speak', 'u'], ['まつ', 'to wait', 'u'], ['あそぶ', 'to play', 'u'],
    ['およぐ', 'to swim', 'u'], ['しぬ', 'to die', 'u'], ['かえる', 'to go home', 'u'], ['はいる', 'to enter', 'u'],
    ['はしる', 'to run', 'u'], ['しる', 'to get to know', 'u'], ['つくる', 'to make', 'u'], ['あう', 'to meet', 'u'],
    ['ある', 'to be / exist (things)', 'u'], ['すわる', 'to sit', 'u'], ['たつ', 'to stand', 'u'], ['もつ', 'to hold / have', 'u'],
    ['いそぐ', 'to hurry', 'u'], ['かす', 'to lend', 'u'], ['よぶ', 'to call', 'u'], ['すむ', 'to live (somewhere)', 'u'],
    ['わかる', 'to understand', 'u'], ['とる', 'to take', 'u'], ['うたう', 'to sing', 'u'], ['あらう', 'to wash', 'u'],
    ['する', 'to do', 'irr'], ['くる', 'to come', 'irr'], ['べんきょうする', 'to study', 'irr'], ['りょこうする', 'to travel', 'irr'],
    ['さんぽする', 'to take a walk', 'irr'], ['もってくる', 'to bring', 'irr'],
  ].map(([dict, en, group]) => ({ dict, en, group, pos: 'verb' }));

  // N5 adjectives: [plain form, english, type]
  const ADJS = [
    ['たかい', 'expensive / tall', 'i'], ['やすい', 'cheap', 'i'], ['おおきい', 'big', 'i'], ['ちいさい', 'small', 'i'],
    ['あつい', 'hot', 'i'], ['さむい', 'cold (weather)', 'i'], ['あたらしい', 'new', 'i'], ['ふるい', 'old (things)', 'i'],
    ['おいしい', 'delicious', 'i'], ['たのしい', 'fun', 'i'], ['むずかしい', 'difficult', 'i'], ['やさしい', 'easy / kind', 'i'],
    ['いそがしい', 'busy', 'i'], ['ながい', 'long', 'i'], ['みじかい', 'short', 'i'], ['おもしろい', 'interesting', 'i'],
    ['いい', 'good', 'i'], ['ちかい', 'near', 'i'], ['とおい', 'far', 'i'], ['あかい', 'red', 'i'],
    ['しずか', 'quiet', 'na'], ['きれい', 'pretty / clean', 'na'], ['げんき', 'healthy / energetic', 'na'], ['ゆうめい', 'famous', 'na'],
    ['べんり', 'convenient', 'na'], ['すき', 'liked', 'na'], ['きらい', 'disliked', 'na'], ['ひま', 'free (not busy)', 'na'],
    ['じょうず', 'skilful', 'na'], ['にぎやか', 'lively', 'na'], ['たいへん', 'tough', 'na'], ['しんせつ', 'kind', 'na'],
  ].map(([dict, en, type]) => ({ dict, en, group: type, pos: 'adj' }));

  // Group 1 ending → [い-row (ます stem), あ-row (ない stem), て-form ending, た-form ending]
  const U = {
    'う': ['い', 'わ', 'って', 'った'], 'つ': ['ち', 'た', 'って', 'った'], 'る': ['り', 'ら', 'って', 'った'],
    'む': ['み', 'ま', 'んで', 'んだ'], 'ぶ': ['び', 'ば', 'んで', 'んだ'], 'ぬ': ['に', 'な', 'んで', 'んだ'],
    'く': ['き', 'か', 'いて', 'いた'], 'ぐ': ['ぎ', 'が', 'いで', 'いだ'], 'す': ['し', 'さ', 'して', 'した'],
  };

  // stems of a verb: { masu, nai, te, ta } (te/ta are full forms)
  function verbParts(v) {
    const d = v.dict;
    if (v.group === 'irr') {
      if (d.endsWith('くる')) { const p = d.slice(0, -2); return { masu: `${p}き`, nai: `${p}こ`, te: `${p}きて`, ta: `${p}きた` }; }
      const p = d.slice(0, -2); // …する
      return { masu: `${p}し`, nai: `${p}し`, te: `${p}して`, ta: `${p}した` };
    }
    if (v.group === 'ru') { const s = d.slice(0, -1); return { masu: s, nai: s, te: `${s}て`, ta: `${s}た` }; }
    const s = d.slice(0, -1), end = d.slice(-1), row = U[end];
    if (d === 'いく') return { masu: 'いき', nai: 'いか', te: 'いって', ta: 'いった' };
    return { masu: s + row[0], nai: s + row[1], te: s + row[2], ta: s + row[3] };
  }

  const VERB_FORMS = {
    masu: { label: 'Polite present', jp: 'ます', make: (p) => `${p.masu}ます`, en: (w) => `(I) ${w.en.replace(/^to /, '')}` },
    masen: { label: 'Polite negative', jp: 'ません', make: (p) => `${p.masu}ません`, en: (w) => `don’t ${w.en.replace(/^to /, '')}` },
    mashita: { label: 'Polite past', jp: 'ました', make: (p) => `${p.masu}ました`, en: (w) => `did: ${w.en.replace(/^to /, '')}` },
    masendeshita: { label: 'Polite past negative', jp: 'ませんでした', make: (p) => `${p.masu}ませんでした`, en: (w) => `didn’t ${w.en.replace(/^to /, '')}` },
    nai: { label: 'Plain negative', jp: 'ない', make: (p, v) => (v.dict === 'ある' ? 'ない' : `${p.nai}ない`), en: (w) => `don’t ${w.en.replace(/^to /, '')} (casual)` },
    ta: { label: 'Plain past', jp: 'た', make: (p) => p.ta, en: (w) => `did: ${w.en.replace(/^to /, '')} (casual)` },
    nakatta: { label: 'Plain past negative', jp: 'なかった', make: (p, v) => (v.dict === 'ある' ? 'なかった' : `${p.nai}なかった`), en: (w) => `didn’t ${w.en.replace(/^to /, '')} (casual)` },
    te: { label: 'て-form', jp: 'て', make: (p) => p.te, en: (w) => `${w.en.replace(/^to /, '')} and… / please…` },
    tai: { label: 'Want to (たい)', jp: 'たい', make: (p) => `${p.masu}たい`, en: (w) => `want ${w.en}` },
    mashou: { label: 'Let’s (ましょう)', jp: 'ましょう', make: (p) => `${p.masu}ましょう`, en: (w) => `let’s ${w.en.replace(/^to /, '')}` },
  };

  const ADJ_FORMS = {
    pres: { label: 'Polite present', jp: 'です', make: (a) => `${a.dict}です` },
    neg: { label: 'Negative', jp: 'くない / じゃない', make: (a) => (a.group === 'i' ? `${ist(a)}くないです` : `${a.dict}じゃないです`) },
    past: { label: 'Past', jp: 'かった / でした', make: (a) => (a.group === 'i' ? `${ist(a)}かったです` : `${a.dict}でした`) },
    pastneg: { label: 'Past negative', jp: 'くなかった / じゃなかった', make: (a) => (a.group === 'i' ? `${ist(a)}くなかったです` : `${a.dict}じゃなかったです`) },
    te: { label: 'て-form (and…)', jp: 'くて / で', make: (a) => (a.group === 'i' ? `${ist(a)}くて` : `${a.dict}で`) },
    noun: { label: 'Before a noun', jp: '〜 + noun', make: (a) => (a.group === 'i' ? `${a.dict} ひと` : `${a.dict}な ひと`) },
  };
  // いい conjugates from よい
  const ist = (a) => (a.dict === 'いい' ? 'よ' : a.dict.slice(0, -1));

  const GROUP_NAME = { u: 'Group 1 (u-verb)', ru: 'Group 2 (ru-verb)', irr: 'Group 3 (irregular)', i: 'い-adjective', na: 'な-adjective' };

  // Why a form looks the way it does — shown after an answer
  function rule(w, form) {
    if (w.pos === 'adj') {
      if (w.dict === 'いい' && form !== 'pres' && form !== 'noun') return 'いい is irregular: it conjugates from よい → よくない, よかった, よくなかった, よくて.';
      if (w.group === 'na' && /い$/.test(w.dict)) return `${w.dict} looks like an い-adjective but is a な-adjective, so the い stays.`;
      const r = {
        pres: 'Just add です.',
        neg: w.group === 'i' ? 'Drop the final い and add くない(です).' : 'Add じゃない(です) (formal: ではありません).',
        past: w.group === 'i' ? 'Drop the final い and add かった(です). Never でした after an い-adjective.' : 'Add でした (casual: だった).',
        pastneg: w.group === 'i' ? 'Drop the final い and add くなかった(です).' : 'Add じゃなかった(です).',
        te: w.group === 'i' ? 'Drop the final い and add くて to link to the next description.' : 'Add で to link to the next description.',
        noun: w.group === 'i' ? 'い-adjectives go straight before the noun.' : 'な-adjectives need な before a noun.',
      };
      return r[form];
    }
    const d = w.dict;
    if (w.group === 'irr') return d.endsWith('くる') ? 'くる is irregular: き(ます), こ(ない), きて, きた.' : 'する is irregular: し(ます), し(ない), して, した. Nouns + する work the same way.';
    if (d === 'いく' && (form === 'te' || form === 'ta')) return 'いく is the one exception: いって / いった (not いいて).';
    if (d === 'ある' && (form === 'nai' || form === 'nakatta')) return 'ある is special: its negative is simply ない / なかった.';
    if (w.group === 'ru') return 'Group 2: drop る and add the ending.';
    const end = d.slice(-1);
    const note = ['かえる', 'はいる', 'はしる', 'しる'].includes(d) ? ` ${d} looks like a Group 2 verb but is Group 1!` : '';
    if (form === 'te' || form === 'ta') {
      const map = { 'う': 'う・つ・る → って', 'つ': 'う・つ・る → って', 'る': 'う・つ・る → って', 'む': 'む・ぶ・ぬ → んで', 'ぶ': 'む・ぶ・ぬ → んで', 'ぬ': 'む・ぶ・ぬ → んで', 'く': 'く → いて', 'ぐ': 'ぐ → いで', 'す': 'す → して' };
      return `Group 1 て/た rule: ${map[end]}${form === 'ta' ? ' (same as て, with た/だ)' : ''}.${note}`;
    }
    if (form === 'nai' || form === 'nakatta') return `Group 1: change the final ${end} to the あ-row (${U[end][1]}) and add ない.${end === 'う' ? ' (う becomes わ, not あ.)' : ''}${note}`;
    return `Group 1: change the final ${end} to the い-row (${U[end][0]}) and add the ending.${note}`;
  }

  function conjugate(w, form) {
    if (w.pos === 'adj') return ADJ_FORMS[form].make(w);
    return VERB_FORMS[form].make(verbParts(w), w);
  }

  // ── Romaji → hiragana, so answers can be typed without a Japanese keyboard ──
  const KANA = {
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ', ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
    sa: 'さ', shi: 'し', si: 'し', su: 'す', se: 'せ', so: 'そ', za: 'ざ', ji: 'じ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
    ta: 'た', chi: 'ち', ti: 'ち', tsu: 'つ', tu: 'つ', te: 'て', to: 'と', da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
    na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の', ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ',
    ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ', pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
    ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も', ya: 'や', yu: 'ゆ', yo: 'よ',
    ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ', wa: 'わ', wo: 'を', nn: 'ん', "n'": 'ん',
    sha: 'しゃ', shu: 'しゅ', sho: 'しょ', cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
    kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ', nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
    hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ', bya: 'びゃ', byu: 'びゅ', byo: 'びょ', pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
    mya: 'みゃ', myu: 'みゅ', myo: 'みょ', rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  };
  function toKana(input) {
    const s = String(input).toLowerCase().replace(/[āâ]/g, 'aa').replace(/[ūû]/g, 'uu').replace(/[ōô]/g, 'ou').replace(/[ēê]/g, 'ee');
    let out = '', i = 0;
    while (i < s.length) {
      const c = s[i];
      if (!/[a-z']/.test(c)) { out += c; i++; continue; }
      // doubled consonant → っ
      if (c === s[i + 1] && /[bcdfghjkmprstwyz]/.test(c)) { out += 'っ'; i++; continue; }
      if (c === 't' && s.slice(i, i + 3) === 'tch') { out += 'っ'; i++; continue; }
      let hit = false;
      for (const len of [3, 2, 1]) {
        const chunk = s.slice(i, i + len);
        if (KANA[chunk]) {
          // a lone n before a consonant (or at the end) is ん
          if (chunk === 'n') break;
          // "nn" + vowel is ん + な-row (konnichiwa → こんにちわ)
          if (chunk === 'nn' && /[aiueoy]/.test(s[i + 2] || '')) break;
          out += KANA[chunk]; i += len; hit = true; break;
        }
      }
      if (hit) continue;
      if (c === 'n') { out += 'ん'; i++; continue; }
      out += c; i++;
    }
    return out;
  }
  // katakana → hiragana, strip spaces & punctuation, romaji → kana
  const normalize = (s) => toKana(String(s).trim())
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/[\s　。、．,.!！?？「」]/g, '');

  window.Conj = { VERBS, ADJS, VERB_FORMS, ADJ_FORMS, GROUP_NAME, conjugate, rule, toKana, normalize, verbParts };
})();
