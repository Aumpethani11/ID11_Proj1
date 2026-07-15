export const COLORS = {
  primary: '#58cc02',
  primaryDark: '#46a302',
  secondary: '#1cb0f6',
  error: '#ff4b4b',
  text: '#4b4b4b',
  border: '#e5e5e5'
};

export const ExerciseType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SIGN_PRACTICE: 'SIGN_PRACTICE',
  WATCH_AND_IDENTIFY: 'WATCH_AND_IDENTIFY'
};

export const Difficulty = {
  EASY: 'EASY',
  INTERMEDIATE: 'INTERMEDIATE',
  HARD: 'HARD'
};

export const DIFFICULTY_LABELS = {
  [Difficulty.EASY]: 'Easy',
  [Difficulty.INTERMEDIATE]: 'Intermediate',
  [Difficulty.HARD]: 'Hard'
};

/**
 * Full SignLingo catalog — every classifier label except "none" / "Z".
 * Order within each difficulty: numbers → words → letters.
 */
export const SIGN_LIBRARY = [
  // ── Easy: numbers ──
  { sign: '0', category: 'number', difficulty: Difficulty.EASY, desc: 'O-shape hand — round zero.' },
  { sign: '1', category: 'number', difficulty: Difficulty.EASY, desc: 'Index finger pointing up.' },
  { sign: '2', category: 'number', difficulty: Difficulty.EASY, desc: 'Index and middle up (peace/V).' },
  { sign: '5', category: 'number', difficulty: Difficulty.EASY, desc: 'Open hand, all five fingers spread.' },
  // ── Easy: words ──
  { sign: 'Hello', category: 'word', difficulty: Difficulty.EASY, desc: 'Open hand waves near the side of the head.' },
  { sign: 'Bye', category: 'word', difficulty: Difficulty.EASY, desc: 'Open hand waves side to side to say goodbye.' },
  { sign: 'Yes', category: 'word', difficulty: Difficulty.EASY, desc: 'Fist nods up and down like a head nod.' },
  { sign: 'No', category: 'word', difficulty: Difficulty.EASY, desc: 'Index and middle snap closed onto the thumb.' },
  { sign: 'Me', category: 'word', difficulty: Difficulty.EASY, desc: 'Point an index finger at your chest.' },
  { sign: 'Ok', category: 'word', difficulty: Difficulty.EASY, desc: 'Fingers form an OK / approval handshape.' },
  { sign: 'Thankyou', category: 'word', difficulty: Difficulty.EASY, desc: 'Flat hand moves forward from the chin.' },
  // ── Easy: letters ──
  { sign: 'A', category: 'letter', difficulty: Difficulty.EASY, desc: 'Fist with thumb on the side.' },
  { sign: 'B', category: 'letter', difficulty: Difficulty.EASY, desc: 'Flat hand, thumb tucked across palm.' },
  { sign: 'C', category: 'letter', difficulty: Difficulty.EASY, desc: 'Curved hand like the letter C.' },
  { sign: 'L', category: 'letter', difficulty: Difficulty.EASY, desc: 'Index up and thumb out (L shape).' },
  { sign: 'O', category: 'letter', difficulty: Difficulty.EASY, desc: 'All fingers touch thumb in an O.' },
  { sign: 'V', category: 'letter', difficulty: Difficulty.EASY, desc: 'Index and middle up and spread.' },
  { sign: 'W', category: 'letter', difficulty: Difficulty.EASY, desc: 'Three middle fingers spread up.' },
  { sign: 'Y', category: 'letter', difficulty: Difficulty.EASY, desc: 'Pinky and thumb out.' },

  // ── Intermediate: numbers ──
  { sign: '3', category: 'number', difficulty: Difficulty.INTERMEDIATE, desc: 'Thumb, index, and middle up.' },
  { sign: '4', category: 'number', difficulty: Difficulty.INTERMEDIATE, desc: 'Four fingers up, thumb tucked.' },
  { sign: '6', category: 'number', difficulty: Difficulty.INTERMEDIATE, desc: 'Thumb touches pinky tip; other fingers up.' },
  // ── Intermediate: words ──
  { sign: 'Please', category: 'word', difficulty: Difficulty.INTERMEDIATE, desc: 'Flat hand circles on the chest.' },
  { sign: 'Name', category: 'word', difficulty: Difficulty.INTERMEDIATE, desc: 'H-hands tap together for “name”.' },
  { sign: 'Meet', category: 'word', difficulty: Difficulty.INTERMEDIATE, desc: 'Index fingers come together to meet.' },
  { sign: 'Learn', category: 'word', difficulty: Difficulty.INTERMEDIATE, desc: 'Fingers pick knowledge from palm to forehead.' },
  { sign: 'Deaf', category: 'word', difficulty: Difficulty.INTERMEDIATE, desc: 'Index moves from ear to mouth (or similar).' },
  { sign: 'Tell', category: 'word', difficulty: Difficulty.INTERMEDIATE, desc: 'Index finger moves forward from the chin.' },
  // ── Intermediate: letters ──
  { sign: 'D', category: 'letter', difficulty: Difficulty.INTERMEDIATE, desc: 'Index up, others circle with thumb.' },
  { sign: 'E', category: 'letter', difficulty: Difficulty.INTERMEDIATE, desc: 'Fingers curled, thumb tucked under.' },
  { sign: 'F', category: 'letter', difficulty: Difficulty.INTERMEDIATE, desc: 'Index and thumb touch (OK sign).' },
  { sign: 'G', category: 'letter', difficulty: Difficulty.INTERMEDIATE, desc: 'Index and thumb pointing sideways.' },
  { sign: 'H', category: 'letter', difficulty: Difficulty.INTERMEDIATE, desc: 'Index and middle pointing sideways.' },
  { sign: 'I', category: 'letter', difficulty: Difficulty.INTERMEDIATE, desc: 'Pinky finger straight up.' },
  { sign: 'K', category: 'letter', difficulty: Difficulty.INTERMEDIATE, desc: 'Index up, middle out, thumb on middle.' },
  { sign: 'U', category: 'letter', difficulty: Difficulty.INTERMEDIATE, desc: 'Index and middle up and touching.' },

  // ── Hard: numbers ──
  { sign: '7', category: 'number', difficulty: Difficulty.HARD, desc: 'Thumb touches ring finger; others up.' },
  { sign: '8', category: 'number', difficulty: Difficulty.HARD, desc: 'Thumb touches middle finger; others up.' },
  { sign: '9', category: 'number', difficulty: Difficulty.HARD, desc: 'Thumb touches index tip; others up.' },
  // ── Hard: words ──
  { sign: 'ILoveYou', category: 'word', difficulty: Difficulty.HARD, desc: 'Pinky, index, and thumb extended (ILY).' },
  { sign: 'NotOk', category: 'word', difficulty: Difficulty.HARD, desc: 'Negated OK / disapproval handshape.' },
  { sign: 'Pen', category: 'word', difficulty: Difficulty.HARD, desc: 'Writing motion mimicking a pen.' },
  // ── Hard: letters ──
  { sign: 'J', category: 'letter', difficulty: Difficulty.HARD, desc: 'Pinky traces a J in the air.' },
  { sign: 'M', category: 'letter', difficulty: Difficulty.HARD, desc: 'Three fingers over the thumb.' },
  { sign: 'N', category: 'letter', difficulty: Difficulty.HARD, desc: 'Two fingers over the thumb.' },
  { sign: 'P', category: 'letter', difficulty: Difficulty.HARD, desc: 'Downward pointing K shape.' },
  { sign: 'Q', category: 'letter', difficulty: Difficulty.HARD, desc: 'Downward pointing G shape.' },
  { sign: 'R', category: 'letter', difficulty: Difficulty.HARD, desc: 'Index and middle fingers crossed.' },
  { sign: 'S', category: 'letter', difficulty: Difficulty.HARD, desc: 'Tight fist, thumb across front.' },
  { sign: 'T', category: 'letter', difficulty: Difficulty.HARD, desc: 'Thumb tucked under index finger.' },
  { sign: 'X', category: 'letter', difficulty: Difficulty.HARD, desc: 'Hooked index finger.' },
];

export const SIGN_DESCRIPTIONS = SIGN_LIBRARY.reduce((map, item) => {
  map[item.sign] = item.desc;
  return map;
}, {});

export const getSignMeta = (sign) =>
  SIGN_LIBRARY.find((item) => item.sign === sign) || null;

const DISPLAY_NAME_OVERRIDES = {
  ILoveYou: 'I Love You',
  Thankyou: 'Thank You',
  NotOk: 'Not OK',
};

export const formatSignDisplayName = (sign) =>
  DISPLAY_NAME_OVERRIDES[sign] || sign;

export const formatSignTitle = (signOrMeta) => {
  const meta =
    typeof signOrMeta === 'string' ? getSignMeta(signOrMeta) : signOrMeta;
  if (!meta) {
    return typeof signOrMeta === 'string' ? signOrMeta : 'Sign';
  }
  if (meta.category === 'number') return `Number ${meta.sign}`;
  if (meta.category === 'word') return formatSignDisplayName(meta.sign);
  return `Letter ${meta.sign}`;
};

export const formatSignPromptLabel = (sign) => {
  const meta = getSignMeta(sign);
  if (!meta) return `'${sign}'`;
  if (meta.category === 'number') return `number '${sign}'`;
  if (meta.category === 'word') return `sign for '${formatSignDisplayName(sign)}'`;
  return `letter '${sign}'`;
};

const CATEGORY_ORDER = { number: 0, word: 1, letter: 2 };

/** Numbers → words → letters within a difficulty. */
export const sortNumbersFirst = (items) =>
  [...items].sort((a, b) => {
    const aOrder = CATEGORY_ORDER[a.category] ?? 99;
    const bOrder = CATEGORY_ORDER[b.category] ?? 99;
    return aOrder - bOrder;
  });

export const getSignsByDifficulty = (difficulty) =>
  sortNumbersFirst(
    SIGN_LIBRARY.filter((item) => item.difficulty === difficulty)
  ).map((item) => item.sign);

const mc = (id, question, options, correctOption) => ({
  id,
  type: ExerciseType.MULTIPLE_CHOICE,
  question,
  options,
  correctOption,
});

const practice = (id, question, targetSign) => ({
  id,
  type: ExerciseType.SIGN_PRACTICE,
  question,
  targetSign,
});

/**
 * Curriculum units grouped by Easy / Intermediate / Hard.
 * Within each level: numbers → words → letters.
 */
export const UNITS = [
  // ─── EASY (numbers → words → letters) ───────────────────
  {
    id: 'easy-numbers-1',
    difficulty: Difficulty.EASY,
    title: 'Easy Numbers: 0, 1, 2, 5',
    description: 'Start counting with clear number signs',
    color: 'bg-[#89e219]',
    lessons: [
      {
        id: 'en1',
        title: 'Zero & One',
        exercises: [
          mc('en1-1', "Which sign is the number 0?", ['0', 'O', '8'], '0'),
          practice('en1-2', "Show me the number 0", '0'),
          practice('en1-3', "Show me the number 1", '1'),
        ],
      },
      {
        id: 'en2',
        title: 'Two & Five',
        exercises: [
          practice('en2-1', "Show me the number 2", '2'),
          practice('en2-2', "Show me the number 5", '5'),
          mc('en2-3', "Open hand with all fingers is…", ['4', '5', '3'], '5'),
        ],
      },
    ],
  },
  {
    id: 'easy-words-1',
    difficulty: Difficulty.EASY,
    title: 'Easy Words: Greetings',
    description: 'Hello, Bye, Yes, No',
    color: 'bg-[#a0e43a]',
    lessons: [
      {
        id: 'ew1',
        title: 'Hello & Bye',
        exercises: [
          mc('ew1-1', "Which sign means Hello?", ['Hello', 'Bye', 'Yes'], 'Hello'),
          practice('ew1-2', "Sign 'Hello'", 'Hello'),
          practice('ew1-3', "Sign 'Bye'", 'Bye'),
        ],
      },
      {
        id: 'ew2',
        title: 'Yes & No',
        exercises: [
          practice('ew2-1', "Sign 'Yes'", 'Yes'),
          practice('ew2-2', "Sign 'No'", 'No'),
          mc('ew2-3', "A fist that nods means…", ['Yes', 'No', 'Ok'], 'Yes'),
        ],
      },
    ],
  },
  {
    id: 'easy-words-2',
    difficulty: Difficulty.EASY,
    title: 'Easy Words: Everyday',
    description: 'Me, Ok, Thank You',
    color: 'bg-[#b8f04e]',
    lessons: [
      {
        id: 'ew3',
        title: 'Me & Ok',
        exercises: [
          practice('ew3-1', "Sign 'Me'", 'Me'),
          practice('ew3-2', "Sign 'Ok'", 'Ok'),
          mc('ew3-3', "Pointing at your chest is…", ['Me', 'Meet', 'Name'], 'Me'),
        ],
      },
      {
        id: 'ew4',
        title: 'Thank You',
        exercises: [
          practice('ew4-1', "Sign 'Thankyou'", 'Thankyou'),
          mc('ew4-2', "Flat hand from the chin is…", ['Please', 'Thankyou', 'Tell'], 'Thankyou'),
          practice('ew4-3', "Say thank you again", 'Thankyou'),
        ],
      },
    ],
  },
  {
    id: 'easy-letters-1',
    difficulty: Difficulty.EASY,
    title: 'Easy Letters: Open Shapes',
    description: 'A, B, C, L — clear beginner handshapes',
    color: 'bg-[#58cc02]',
    lessons: [
      {
        id: 'el1',
        title: 'A & B Basics',
        exercises: [
          mc('el1-1', "Identify the sign for 'A'", ['A', 'S', 'E'], 'A'),
          practice('el1-2', "Show me the letter 'A'", 'A'),
          practice('el1-3', "Show me the letter 'B'", 'B'),
          mc('el1-4', "Which is a flat open hand?", ['A', 'B', 'S'], 'B'),
        ],
      },
      {
        id: 'el2',
        title: 'C & L Shapes',
        exercises: [
          mc('el2-1', "Which letter looks like a 'C'?", ['O', 'C', 'G'], 'C'),
          practice('el2-2', "Sign the letter 'C'", 'C'),
          practice('el2-3', "Make an 'L' shape", 'L'),
          mc('el2-4', "Index up + thumb out is…", ['L', 'G', 'D'], 'L'),
        ],
      },
    ],
  },
  {
    id: 'easy-letters-2',
    difficulty: Difficulty.EASY,
    title: 'Easy Letters: Spread Fingers',
    description: 'O, V, W, Y',
    color: 'bg-[#7ac70c]',
    lessons: [
      {
        id: 'el3',
        title: 'O & V',
        exercises: [
          practice('el3-1', "Make an 'O' shape", 'O'),
          practice('el3-2', "Two fingers spread for 'V'", 'V'),
          mc('el3-3', "Two fingers like a peace sign is…", ['U', 'V', 'W'], 'V'),
        ],
      },
      {
        id: 'el4',
        title: 'W & Y',
        exercises: [
          practice('el4-1', "Three fingers spread for 'W'", 'W'),
          practice('el4-2', "Pinky and thumb out for 'Y'", 'Y'),
          mc('el4-3', "Pinky + thumb out is…", ['I', 'Y', 'L'], 'Y'),
        ],
      },
    ],
  },

  // ─── INTERMEDIATE (numbers → words → letters) ──────────
  {
    id: 'int-numbers-1',
    difficulty: Difficulty.INTERMEDIATE,
    title: 'Intermediate Numbers: 3, 4, 6',
    description: 'Refine counting handshapes',
    color: 'bg-[#14d4f4]',
    lessons: [
      {
        id: 'in1',
        title: 'Three & Four',
        exercises: [
          practice('in1-1', "Show me the number 3", '3'),
          practice('in1-2', "Show me the number 4", '4'),
          mc('in1-3', "Four fingers up (thumb tucked) is…", ['3', '4', '5'], '4'),
        ],
      },
      {
        id: 'in2',
        title: 'Number Six',
        exercises: [
          practice('in2-1', "Show me the number 6", '6'),
          mc('in2-2', "Thumb touching pinky is…", ['6', '7', '8'], '6'),
          practice('in2-3', "Sign 6 once more", '6'),
        ],
      },
    ],
  },
  {
    id: 'int-words-1',
    difficulty: Difficulty.INTERMEDIATE,
    title: 'Intermediate Words: Social',
    description: 'Please, Name, Meet',
    color: 'bg-[#45c7f0]',
    lessons: [
      {
        id: 'iw1',
        title: 'Please & Name',
        exercises: [
          practice('iw1-1', "Sign 'Please'", 'Please'),
          practice('iw1-2', "Sign 'Name'", 'Name'),
          mc('iw1-3', "Circling on the chest is…", ['Please', 'Thankyou', 'Learn'], 'Please'),
        ],
      },
      {
        id: 'iw2',
        title: 'Meet',
        exercises: [
          practice('iw2-1', "Sign 'Meet'", 'Meet'),
          mc('iw2-2', "Index fingers coming together is…", ['Meet', 'Me', 'Name'], 'Meet'),
          practice('iw2-3', "Sign Meet again", 'Meet'),
        ],
      },
    ],
  },
  {
    id: 'int-words-2',
    difficulty: Difficulty.INTERMEDIATE,
    title: 'Intermediate Words: Express',
    description: 'Learn, Deaf, Tell',
    color: 'bg-[#2bb8e8]',
    lessons: [
      {
        id: 'iw3',
        title: 'Learn & Deaf',
        exercises: [
          practice('iw3-1', "Sign 'Learn'", 'Learn'),
          practice('iw3-2', "Sign 'Deaf'", 'Deaf'),
          mc('iw3-3', "Which sign means Learn?", ['Learn', 'Tell', 'Name'], 'Learn'),
        ],
      },
      {
        id: 'iw4',
        title: 'Tell',
        exercises: [
          practice('iw4-1', "Sign 'Tell'", 'Tell'),
          mc('iw4-2', "Index forward from the chin is…", ['Tell', 'Thankyou', 'Me'], 'Tell'),
          practice('iw4-3', "Sign Tell once more", 'Tell'),
        ],
      },
    ],
  },
  {
    id: 'int-letters-1',
    difficulty: Difficulty.INTERMEDIATE,
    title: 'Intermediate: D–H',
    description: 'D, E, F, G, H — tighter finger control',
    color: 'bg-[#1cb0f6]',
    lessons: [
      {
        id: 'il1',
        title: 'D & E',
        exercises: [
          mc('il1-1', "Which one is 'D'?", ['F', 'D', 'I'], 'D'),
          practice('il1-2', "Show me 'D'", 'D'),
          practice('il1-3', "Clench your fingers for 'E'", 'E'),
        ],
      },
      {
        id: 'il2',
        title: 'F, G & H',
        exercises: [
          practice('il2-1', "Make the 'OK' shape for 'F'", 'F'),
          practice('il2-2', "Point sideways for 'G'", 'G'),
          practice('il2-3', "Two fingers horizontal for 'H'", 'H'),
          mc('il2-4', "Index + thumb touching (OK) is…", ['F', 'O', '9'], 'F'),
        ],
      },
    ],
  },
  {
    id: 'int-letters-2',
    difficulty: Difficulty.INTERMEDIATE,
    title: 'Intermediate: I, K, U',
    description: 'Pinky focus and two-finger variants',
    color: 'bg-[#1899d6]',
    lessons: [
      {
        id: 'il3',
        title: 'I & K',
        exercises: [
          practice('il3-1', "Raise your pinky for 'I'", 'I'),
          practice('il3-2', "Make a 'V' with a thumb for 'K'", 'K'),
          mc('il3-3', "Only the pinky up is…", ['I', 'J', 'Y'], 'I'),
        ],
      },
      {
        id: 'il4',
        title: 'U Practice',
        exercises: [
          practice('il4-1', "Two fingers up and touching for 'U'", 'U'),
          mc('il4-2', "Two fingers together pointing up is…", ['U', 'V', 'H'], 'U'),
          practice('il4-3', "Show me 'U' again", 'U'),
        ],
      },
    ],
  },

  // ─── HARD (numbers → words → letters) ───────────────────
  {
    id: 'hard-numbers-1',
    difficulty: Difficulty.HARD,
    title: 'Hard Numbers: 7, 8, 9',
    description: 'Thumb-to-finger contact counting',
    color: 'bg-[#d33131]',
    lessons: [
      {
        id: 'hn1',
        title: 'Seven & Eight',
        exercises: [
          practice('hn1-1', "Show me the number 7", '7'),
          practice('hn1-2', "Show me the number 8", '8'),
          mc('hn1-3', "Thumb touching the middle finger is…", ['7', '8', '9'], '8'),
        ],
      },
      {
        id: 'hn2',
        title: 'Number Nine',
        exercises: [
          practice('hn2-1', "Show me the number 9", '9'),
          mc('hn2-2', "Thumb touching the index tip is…", ['6', 'F', '9'], '9'),
          practice('hn2-3', "Sign 9 one more time", '9'),
        ],
      },
    ],
  },
  {
    id: 'hard-words-1',
    difficulty: Difficulty.HARD,
    title: 'Hard Words: Express More',
    description: 'I Love You, Not OK, Pen',
    color: 'bg-[#ff6b6b]',
    lessons: [
      {
        id: 'hw1',
        title: 'I Love You',
        exercises: [
          practice('hw1-1', "Sign 'ILoveYou'", 'ILoveYou'),
          mc('hw1-2', "Pinky + index + thumb out is…", ['ILoveYou', 'Y', 'I'], 'ILoveYou'),
          practice('hw1-3', "Show I Love You again", 'ILoveYou'),
        ],
      },
      {
        id: 'hw2',
        title: 'Not OK & Pen',
        exercises: [
          practice('hw2-1', "Sign 'NotOk'", 'NotOk'),
          practice('hw2-2', "Sign 'Pen'", 'Pen'),
          mc('hw2-3', "Which means Not OK?", ['Ok', 'NotOk', 'No'], 'NotOk'),
        ],
      },
    ],
  },
  {
    id: 'hard-letters-1',
    difficulty: Difficulty.HARD,
    title: 'Hard Letters: Look-Alikes',
    description: 'M, N, S, T — easy to mix up',
    color: 'bg-[#ff9600]',
    lessons: [
      {
        id: 'hl1',
        title: 'M vs N',
        exercises: [
          mc('hl1-1', "Three fingers over the thumb is…", ['M', 'N', 'W'], 'M'),
          practice('hl1-2', "Three fingers over for 'M'", 'M'),
          practice('hl1-3', "Two fingers over for 'N'", 'N'),
          mc('hl1-4', "Two fingers over the thumb is…", ['M', 'N', 'A'], 'N'),
        ],
      },
      {
        id: 'hl2',
        title: 'S vs T',
        exercises: [
          practice('hl2-1', "Make a tight fist for 'S'", 'S'),
          practice('hl2-2', "Thumb under index for 'T'", 'T'),
          mc('hl2-3', "Thumb tucked under the index is…", ['A', 'S', 'T'], 'T'),
        ],
      },
    ],
  },
  {
    id: 'hard-letters-2',
    difficulty: Difficulty.HARD,
    title: 'Hard Letters: Precision',
    description: 'J, P, Q, R, X — orientation & motion',
    color: 'bg-[#ff4b4b]',
    lessons: [
      {
        id: 'hl3',
        title: 'J, P & Q',
        exercises: [
          practice('hl3-1', "Trace a hook in the air for 'J'", 'J'),
          practice('hl3-2', "Point 'K' downwards for 'P'", 'P'),
          practice('hl3-3', "Point 'G' downwards for 'Q'", 'Q'),
        ],
      },
      {
        id: 'hl4',
        title: 'R & X',
        exercises: [
          practice('hl4-1', "Cross your fingers for 'R'", 'R'),
          practice('hl4-2', "Hook your index finger for 'X'", 'X'),
          mc('hl4-3', "Crossed index and middle is…", ['U', 'R', 'K'], 'R'),
        ],
      },
    ],
  },
];

export const TOTAL_LESSON_COUNT = UNITS.reduce(
  (count, unit) => count + unit.lessons.length,
  0
);
