import { SignImageData } from "../data/SignImageData";

const SIGN_BY_NORMALIZED_NAME = SignImageData.reduce((map, sign) => {
  map[sign.name.toLowerCase().replace(/\s+/g, "")] = sign;
  return map;
}, {});

export const WORD_ALIASES = {
  hello: "Hello",
  hi: "Hello",
  goodbye: "Bye",
  bye: "Bye",
  "thank you": "Thankyou",
  thanks: "Thankyou",
  thankyou: "Thankyou",
  yes: "Yes",
  no: "No",
  ok: "Ok",
  okay: "Ok",
  please: "Please",
  sorry: "NotOk",
  name: "Name",
  me: "Me",
  love: "ILoveYou",
  "i love you": "ILoveYou",
  iloveyou: "ILoveYou",
  learn: "Learn",
  meet: "Meet",
  tell: "Tell",
  deaf: "Deaf",
  pen: "Pen",
  notok: "NotOk",
  "not ok": "NotOk",
};

const SIGN_INSTRUCTIONS = {
  Hello: "Start with your hand near your forehead, then wave outward",
  Bye: "Wave your hand up and down in a goodbye gesture",
  Thankyou: "Touch your chin with fingertips, then move hand forward",
  Yes: "Make a fist and move it up and down like nodding",
  No: "Touch your fingertips together, then separate them",
  Ok: "Make a circle with thumb and index finger, other fingers extended",
  Please: "Rub your chest in a circular motion with your palm",
  NotOk: "Make a fist and rub it in circular motion on your chest",
  Name: "Tap your index and middle fingers together twice",
  Me: "Point to your chest with your index finger",
  ILoveYou: "Extend thumb, index, and pinky while keeping other fingers down",
  Learn: "Touch your forehead, then move your hand to your other palm",
  Meet: "Bring both index fingers together in front of you",
  Tell: "Touch your chin with fingertips, then move hand forward",
  Deaf: "Touch your ear with one finger, then touch your mouth",
  Pen: "Hold your hand like holding a pen and make writing motions",
};

const SIGN_DESCRIPTIONS = {
  Hello: "Wave your hand from side to side",
  Bye: "Wave your hand up and down",
  Thankyou: "Touch your chin and move hand forward",
  Yes: "Make a fist and nod up and down",
  No: "Touch fingertips together and separate",
  Ok: "Make OK sign with thumb and index finger",
  Please: "Rub your chest in circular motion",
  NotOk: "Make a fist and rub on chest",
  Name: "Tap your index and middle fingers together",
  Me: "Point to yourself",
  ILoveYou: "Sign I, L, and Y combined",
  Learn: "Touch your forehead and move hand to other hand",
  Meet: "Bring both index fingers together",
  Tell: "Touch your chin and move hand forward",
  Deaf: "Touch your ear and then your mouth",
  Pen: "Make writing motion with hand",
};

export const getSignDisplayName = (signName) => {
  const displayNames = {
    ILoveYou: "I Love You",
    Thankyou: "Thank You",
    NotOk: "Not OK",
  };

  return displayNames[signName] || signName;
};

export const formatSignForSpeech = (signName) => {
  const speechNames = {
    ILoveYou: "I love you",
    Thankyou: "thank you",
    NotOk: "not ok",
    Ok: "okay",
  };

  return speechNames[signName] || signName;
};

export const formatSentenceForDisplay = (sentence) => {
  if (!sentence || !sentence.trim()) return sentence;

  return sentence
    .split(/\s+/)
    .map((word) => getSignDisplayName(word))
    .join(" ");
};

export const formatSentenceForSpeech = (sentence) => {
  if (!sentence || !sentence.trim()) return sentence;

  return sentence
    .split(/\s+/)
    .map((word) => formatSignForSpeech(word))
    .join(" ");
};

export const findSignByName = (signName) => {
  if (!signName) return null;

  const normalizedName = signName.toLowerCase().replace(/\s+/g, "");
  const directMatch = SIGN_BY_NORMALIZED_NAME[normalizedName];

  if (directMatch) {
    return directMatch;
  }

  return SignImageData.find((sign) => {
    const normalizedImageName = sign.name.toLowerCase().replace(/\s+/g, "");
    return (
      normalizedImageName.includes(normalizedName) ||
      normalizedName.includes(normalizedImageName)
    );
  });
};

export const createSignEntry = (signName) => {
  const signData = findSignByName(signName);

  if (!signData) {
    return null;
  }

  return {
    name: signData.name,
    displayName: getSignDisplayName(signData.name),
    description:
      SIGN_DESCRIPTIONS[signData.name] ||
      `Sign for ${getSignDisplayName(signData.name)}`,
    image: signData.url,
    instructions:
      SIGN_INSTRUCTIONS[signData.name] ||
      `Perform the ${getSignDisplayName(signData.name)} sign`,
  };
};

export const buildSignSequenceFromText = (text) => {
  if (!text || !text.trim()) return [];

  const sequence = [];
  const tokens = text.trim().split(/\s+/);

  tokens.forEach((token) => {
    const normalizedToken = token.toLowerCase();
    const aliasMatch = WORD_ALIASES[normalizedToken];

    if (aliasMatch) {
      const entry = createSignEntry(aliasMatch);
      if (entry) {
        sequence.push(entry);
      }
      return;
    }

    const directEntry = createSignEntry(token);
    if (directEntry) {
      sequence.push(directEntry);
      return;
    }

    const letters = token.split("");
    letters.forEach((letter) => {
      const letterEntry = createSignEntry(letter);
      if (letterEntry) {
        sequence.push(letterEntry);
      }
    });
  });

  return sequence;
};
