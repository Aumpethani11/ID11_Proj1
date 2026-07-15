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

export const UNITS = [
  {
    id: 'u1',
    title: 'Unit 1: Foundations',
    description: 'Letters A through E',
    color: 'bg-[#58cc02]',
    lessons: [
      {
        id: 'l1',
        title: 'Vowels & Shapes (A-C)',
        exercises: [
          { id: 'e1', type: ExerciseType.MULTIPLE_CHOICE, question: "Identify the sign for 'A'", options: ['A', 'B', 'S'], correctOption: 'A' },
          { id: 'e2', type: ExerciseType.SIGN_PRACTICE, question: "Show me the letter 'A'", targetSign: 'A' },
          { id: 'e3', type: ExerciseType.SIGN_PRACTICE, question: "Show me the letter 'B'", targetSign: 'B' },
          { id: 'e4', type: ExerciseType.MULTIPLE_CHOICE, question: "Which letter looks like a 'C' shape?", options: ['O', 'C', 'G'], correctOption: 'C' },
          { id: 'e5', type: ExerciseType.SIGN_PRACTICE, question: "Sign the letter 'C'", targetSign: 'C' }
        ]
      },
      {
        id: 'l2',
        title: 'Expanding (D-E)',
        exercises: [
          { id: 'e6', type: ExerciseType.MULTIPLE_CHOICE, question: "Which one is 'D'?", options: ['F', 'D', 'I'], correctOption: 'D' },
          { id: 'e7', type: ExerciseType.SIGN_PRACTICE, question: "Show me 'D'", targetSign: 'D' },
          { id: 'e8', type: ExerciseType.SIGN_PRACTICE, question: "Clench your fingers for 'E'", targetSign: 'E' }
        ]
      }
    ]
  },
  {
    id: 'u2',
    title: 'Unit 2: Finger Positions',
    description: 'Letters F through J',
    color: 'bg-[#1cb0f6]',
    lessons: [
      {
        id: 'l3',
        title: 'The OK Sign & Beyond (F-H)',
        exercises: [
          { id: 'e9', type: ExerciseType.SIGN_PRACTICE, question: "Make the 'OK' shape for 'F'", targetSign: 'F' },
          { id: 'e10', type: ExerciseType.SIGN_PRACTICE, question: "Point your index for 'G'", targetSign: 'G' },
          { id: 'e11', type: ExerciseType.SIGN_PRACTICE, question: "Two fingers horizontal for 'H'", targetSign: 'H' }
        ]
      },
      {
        id: 'l4',
        title: 'Pinky & Hooks (I-J)',
        exercises: [
          { id: 'e12', type: ExerciseType.SIGN_PRACTICE, question: "Raise your pinky for 'I'", targetSign: 'I' },
          { id: 'e13', type: ExerciseType.SIGN_PRACTICE, question: "Draw a hook in the air for 'J'", targetSign: 'J' }
        ]
      }
    ]
  },
  {
    id: 'u3',
    title: 'Unit 3: Mid-Alphabet',
    description: 'Letters K through O',
    color: 'bg-[#ce82ff]',
    lessons: [
      {
        id: 'l5',
        title: 'Two-Finger Signs (K-L)',
        exercises: [
          { id: 'e14', type: ExerciseType.SIGN_PRACTICE, question: "Make a 'V' with a thumb for 'K'", targetSign: 'K' },
          { id: 'e15', type: ExerciseType.SIGN_PRACTICE, question: "Make an 'L' shape", targetSign: 'L' }
        ]
      },
      {
        id: 'l6',
        title: 'The Folds (M-O)',
        exercises: [
          { id: 'e16', type: ExerciseType.MULTIPLE_CHOICE, question: "Three fingers over thumb is...", options: ['M', 'N', 'W'], correctOption: 'M' },
          { id: 'e17', type: ExerciseType.SIGN_PRACTICE, question: "Three fingers over for 'M'", targetSign: 'M' },
          { id: 'e18', type: ExerciseType.SIGN_PRACTICE, question: "Two fingers over for 'N'", targetSign: 'N' },
          { id: 'e19', type: ExerciseType.SIGN_PRACTICE, question: "Make an 'O' shape", targetSign: 'O' }
        ]
      }
    ]
  },
  {
    id: 'u4',
    title: 'Unit 4: Precision Signs',
    description: 'Letters P through T',
    color: 'bg-[#ff9600]',
    lessons: [
      {
        id: 'l7',
        title: 'Downward & Crossed (P-R)',
        exercises: [
          { id: 'e20', type: ExerciseType.SIGN_PRACTICE, question: "Point 'K' downwards for 'P'", targetSign: 'P' },
          { id: 'e21', type: ExerciseType.SIGN_PRACTICE, question: "Point 'G' downwards for 'Q'", targetSign: 'Q' },
          { id: 'e22', type: ExerciseType.SIGN_PRACTICE, question: "Cross your fingers for 'R'", targetSign: 'R' }
        ]
      },
      {
        id: 'l8',
        title: 'Fists & Thumbs (S-T)',
        exercises: [
          { id: 'e23', type: ExerciseType.SIGN_PRACTICE, question: "Make a tight fist for 'S'", targetSign: 'S' },
          { id: 'e24', type: ExerciseType.SIGN_PRACTICE, question: "Thumb between index and middle for 'T'", targetSign: 'T' }
        ]
      }
    ]
  },
  {
    id: 'u5',
    title: 'Unit 5: The Home Stretch',
    description: 'Letters U through Z',
    color: 'bg-[#ff4b4b]',
    lessons: [
      {
        id: 'l9',
        title: 'Upward Fingers (U-W)',
        exercises: [
          { id: 'e25', type: ExerciseType.SIGN_PRACTICE, question: "Two fingers up for 'U'", targetSign: 'U' },
          { id: 'e26', type: ExerciseType.SIGN_PRACTICE, question: "Two fingers spread for 'V'", targetSign: 'V' },
          { id: 'e27', type: ExerciseType.SIGN_PRACTICE, question: "Three fingers spread for 'W'", targetSign: 'W' }
        ]
      },
      {
        id: 'l10',
        title: 'The Final Letters (X-Z)',
        exercises: [
          { id: 'e28', type: ExerciseType.SIGN_PRACTICE, question: "Hook your index finger for 'X'", targetSign: 'X' },
          { id: 'e29', type: ExerciseType.SIGN_PRACTICE, question: "Pinky and thumb out for 'Y'", targetSign: 'Y' },
          { id: 'e30', type: ExerciseType.SIGN_PRACTICE, question: "Draw a 'Z' in the air with index", targetSign: 'Z' }
        ]
      }
    ]
  }
];
