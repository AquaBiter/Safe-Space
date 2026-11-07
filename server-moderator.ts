// Multi-lingual zero-tolerance curse words, profanity, and cyberbullying detection engine

export interface QuickModerationCheck {
  isBlocked: boolean;
  category: 'cyberbullying' | 'none';
  language: string;
  reason: string;
  toxicityScore: number;
}

// Exact and boundary-checked profanity list
const ENGLISH_PROFANITIES = [
  'fuck', 'fucking', 'fucked', 'fucker', 'fuckers', 'fucks', 'fuckoff', 'motherfucker', 'motherfucking',
  'shit', 'shits', 'shitty', 'bullshit', 'dipshit', 'horseshit',
  'bitch', 'bitches', 'bitchy', 'bitching',
  'asshole', 'assholes', 'dumbass', 'jackass', 'smartass',
  'cunt', 'cunts', 'dick', 'dicks', 'dickhead', 'pussy', 'pussies',
  'slut', 'sluts', 'whore', 'whores', 'bastard', 'bastards',
  'twat', 'wanker', 'prick', 'damn', 'goddamn',
  'nigger', 'faggot', 'retard', 'chink', 'spic', 'kike', 'tranny',
];

const TAGALOG_PROFANITIES = [
  'puta', 'tangina', 'tang ina', 'putangina', 'putang ina', 'taena', 'ina mo', 'ina ka',
  'gago', 'gaga', 'ogag', 'tanga', 'bobo', 'tarantado', 'ulol', 'inutil',
  'kupal', 'hudas', 'peste', 'leche', 'letse', 'pakyu', 'pakshet', 'punyeta',
  'pokpok', 'malandi', 'bayag', 'titi', 'puke', 'kantot',
];

const SPANISH_PROFANITIES = [
  'puta', 'puto', 'hijo de puta', 'hija de puta', 'hdp',
  'mierda', 'mierdas',
  'pendejo', 'pendeja', 'pendejos', 'cabrón', 'cabron', 'cabrona', 'cabrones',
  'coño', 'cono', 'verga', 'chinga', 'chingar', 'chingada', 'chingatumadre',
  'culero', 'maricón', 'maricon', 'estúpido', 'estupido', 'idiota', 'imbécil', 'imbecil',
];

const FRENCH_PROFANITIES = [
  'merde', 'putain', 'connard', 'salope', 'bâtard', 'batard', 'enculé', 'encule',
];

const GERMAN_PROFANITIES = [
  'scheisse', 'scheiße', 'arschloch', 'schlampe', 'hurensohn', 'wichser',
];

// Targeted insults, demeaning words, and hostile labels
const HOSTILE_INSULT_WORDS = [
  'loser', 'losers', 'freak', 'freaks', 'idiot', 'idiots', 'moron', 'morons',
  'imbecile', 'scum', 'clown', 'weirdo', 'creep', 'psycho', 'jerk', 'worthless',
  'pathetic', 'disgusting', 'fraud', 'liar', 'fake',
];

// Bullying phrases, hostile claims, and personal attacks
const BULLYING_PHRASES = [
  // Demeaning and hostile insults
  'good for nothing', 'good-for-nothing', 'good for nothing loser',
  'kill yourself', 'kill urself', 'kys', 'drop dead', 'die in a fire', 'go die',
  'nobody cares about you', 'nobody loves you', 'nobody likes you', 'everyone hates you',
  'waste of space', 'waste of air', 'you are worthless', 'you are ugly', 'you are pathetic',
  "you're ugly", "you're worthless", "you're pathetic", "you're a loser", 'you are a loser',
  'ugly loser', 'pathetic loser', 'total loser', 'such a loser', 'what a loser',
  'you suck', 'you are an idiot', "you're an idiot", 'stupid idiot', 'shut the fuck up',
  'stfu', 'shut up', 'shut your mouth', 'get lost', 'get out of here', 'go away',
  'attention seeker', 'drama queen', 'stop crying', 'you should die', 'die die die',
  'nobody asked you', 'nobody asked', 'no one asked', 'you deserve to die',

  // Tagalog bullying & hostile statements
  'mamatay ka na', 'manahimik ka', 'bobo mo', 'pangit mo', 'salot ka', 'walang kwenta',
  'hayop ka', 'leche ka', 'gago ka', 'tanga ka', 'tarantado ka', 'ulol ka', 'inutil ka',
  'walang silbi',

  // Spanish bullying & hostile statements
  'muérete', 'muerete', 'púdrete', 'pudrete', 'eres una basura', 'no sirves para nada',
  'bueno para nada', 'nadie te quiere', 'eres un asco', 'cállate', 'callate', 'vete al diablo',

  // French / German bullying
  'va te faire foutre', 'crève', 'creve', 'dégage',
];

// Invalidating questioning constructs, dismissive hostility, and veiled / incomplete profanity
const INVALIDATING_CONSTRUCTS = [
  // Hostile questioning & identity invalidation
  'just who are you',
  'who do you think you are',
  'who even are you',
  'who are you even',
  'who the hell are you',
  'who tf are you',
  'who asked you',
  'who even asked',
  'who asked',
  'nobody asked you',
  'nobody asked',
  'no one asked',
  'who cares',
  'who even cares',
  'nobody cares',
  'no one cares',
  'why are you here',
  'why are you even here',
  'why post this',
  'why are you posting',
  'why did you post this',
  'why would you post this',

  // Veiled / incomplete profanity and cynical sneers
  'what the',
  'what the heck',
  'what the hell',
  'the hell is this',
  'the fuck is this',
  'tf is this',
  'wtf',
  'wth',

  // Cynical disparagement & dismissals
  'cry about it',
  'cry harder',
  'cope harder',
  'cope',
  'seethe',
  'touch grass',
  'get a life',
  'grow up',
  'get over it',
  'stop crying',
  'stop whining',
  'stop complaining',
  'so cringe',
  'cringe',
  'delete this',
  'log off',
  'is this a joke',
  'you must be joking',
  'are you serious',

  // Multi-lingual dismissive / invalidating constructs (Tagalog & Spanish)
  'sino ka ba',
  'sino ka para',
  'sino nagtanong',
  'walang nagtanong',
  'walang may pake',
  'anong pakialam namin',
  'ano ba naman',
  'ano ba yan',
  'quién te crees',
  'quien te crees',
  'a quién le importa',
  'a quien le importa',
  'nadie te preguntó',
  'nadie te pregunto',
];

// Leetspeak normalization
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@]/g, 'a')
    .replace(/[\$]/g, 's')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[*#^~]/g, '')
    .trim();
}

// Compact text without spaces or separators
function compactText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function detectCurseWordsAndBullying(rawText: string): QuickModerationCheck | null {
  if (!rawText || typeof rawText !== 'string') return null;

  const normalized = normalizeText(rawText);
  // Clean punctuation from ends
  const cleaned = normalized.replace(/^[\s,.;:!?\-+()\[\]{}'"]+|[\s,.;:!?\-+()\[\]{}'"]+$/g, '');
  const words = normalized.split(/[\s,.;:!?\-+()\[\]{}'"]+/).filter(Boolean);
  const compacted = compactText(rawText);

  // Check English profanity
  for (const profanity of ENGLISH_PROFANITIES) {
    if (words.includes(profanity)) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'English',
        reason: `Contains prohibited curse word or profanity ("${profanity}"). SafeSpace enforces zero tolerance for vulgarity and bullying.`,
        toxicityScore: 95,
      };
    }
    if (profanity.length >= 4 && compacted.includes(profanity)) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'English',
        reason: `Contains prohibited curse word or profanity. SafeSpace enforces zero tolerance for vulgarity and bullying.`,
        toxicityScore: 95,
      };
    }
    const regex = new RegExp(`\\b${profanity}\\b`, 'i');
    if (regex.test(normalized)) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'English',
        reason: `Contains prohibited curse word or profanity ("${profanity}"). SafeSpace enforces zero tolerance for vulgarity and bullying.`,
        toxicityScore: 95,
      };
    }
  }

  // Check Tagalog profanity
  for (const profanity of TAGALOG_PROFANITIES) {
    if (words.includes(profanity) || normalized.includes(profanity) || (profanity.length >= 4 && compacted.includes(profanity.replace(/\s+/g, '')))) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'Tagalog / Filipino',
        reason: `Contains prohibited Tagalog curse word or insult ("${profanity}"). SafeSpace strictly prohibits offensive language.`,
        toxicityScore: 96,
      };
    }
  }

  // Check Spanish profanity
  for (const profanity of SPANISH_PROFANITIES) {
    const regex = new RegExp(`\\b${profanity}\\b`, 'i');
    if (words.includes(profanity) || regex.test(normalized) || (profanity.length >= 4 && compacted.includes(profanity.replace(/\s+/g, '')))) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'Spanish',
        reason: `Contains prohibited Spanish curse word or vulgarity ("${profanity}"). SafeSpace enforces zero tolerance for vulgarity.`,
        toxicityScore: 95,
      };
    }
  }

  // Check French profanity
  for (const profanity of FRENCH_PROFANITIES) {
    const regex = new RegExp(`\\b${profanity}\\b`, 'i');
    if (words.includes(profanity) || regex.test(normalized)) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'French',
        reason: `Contains prohibited French curse word or profanity.`,
        toxicityScore: 95,
      };
    }
  }

  // Check German profanity
  for (const profanity of GERMAN_PROFANITIES) {
    const regex = new RegExp(`\\b${profanity}\\b`, 'i');
    if (words.includes(profanity) || regex.test(normalized)) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'German',
        reason: `Contains prohibited German curse word or profanity.`,
        toxicityScore: 95,
      };
    }
  }

  // Check Bullying phrases & targeted hostile attacks
  for (const phrase of BULLYING_PHRASES) {
    if (normalized.includes(phrase) || compacted.includes(compactText(phrase))) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'Detected Multi-lingual',
        reason: `Contains hostile bullying, insult, or personal attack ("${phrase}"). SafeSpace protects visitors from cyberbullying and demeaning language.`,
        toxicityScore: 98,
      };
    }
  }

  // Check Invalidating sentence constructs, dismissive questioning & veiled profanities
  for (const construct of INVALIDATING_CONSTRUCTS) {
    // Exact or clause match
    if (cleaned === construct || normalized.includes(construct) || compacted.includes(compactText(construct))) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'Detected Multi-lingual',
        reason: `Contains hostile invalidation, dismissive sentence construct, or veiled profanity ("${construct}"). SafeSpace maintains a kind and supportive environment.`,
        toxicityScore: 90,
      };
    }
  }

  // Standalone dismissive questioning like "who are you"
  if (cleaned === 'who are you' || cleaned === 'who are you?' || cleaned.startsWith('who are you to')) {
    return {
      isBlocked: true,
      category: 'cyberbullying',
      language: 'English',
      reason: `Contains dismissive questioning or personal invalidation ("who are you"). SafeSpace requires respectful, constructive interactions.`,
      toxicityScore: 88,
    };
  }

  // Check single hostile insult words (e.g. "you loser", "such a loser", "loser")
  for (const insult of HOSTILE_INSULT_WORDS) {
    const regex = new RegExp(`\\b${insult}\\b`, 'i');
    if (regex.test(normalized)) {
      return {
        isBlocked: true,
        category: 'cyberbullying',
        language: 'English',
        reason: `Contains derogatory insult ("${insult}") intended to demean or bully. SafeSpace strictly forbids toxic language.`,
        toxicityScore: 90,
      };
    }
  }

  return null;
}
