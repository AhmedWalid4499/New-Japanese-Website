// The N5 grammar course: units + all modules (course1.js and course2.js hold the lessons).
// Load after course1.js and course2.js. Shared by the website and the iPhone app.

const COURSE_UNITS = [
  { n: 1, title: 'Sentence basics', jp: 'きほん', color: '#d6336c' },
  { n: 2, title: 'Particles', jp: 'じょし', color: '#3b5a8c' },
  { n: 3, title: 'Verbs', jp: 'どうし', color: '#5d8a2f' },
  { n: 4, title: 'Adjectives', jp: 'けいようし', color: '#b2547a' },
  { n: 5, title: 'The て-form', jp: 'てけい', color: '#c4762b' },
  { n: 6, title: 'Wants & plans', jp: 'きぼう', color: '#6b5bd2' },
  { n: 7, title: 'Connecting ideas', jp: 'つなぐ', color: '#1d8676' },
];

const GRAMMAR_COURSE = [
  ...(typeof GRAMMAR_COURSE_1 !== 'undefined' ? GRAMMAR_COURSE_1 : []),
  ...(typeof GRAMMAR_COURSE_2 !== 'undefined' ? GRAMMAR_COURSE_2 : []),
].map((m, i) => ({ ...m, n: i + 1 }));
