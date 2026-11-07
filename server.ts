import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { detectCurseWordsAndBullying } from './server-moderator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = express();
app.use(express.json());

// Initialize Google Gemini AI SDK on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ModerationResult {
  status: 'APPROVED' | 'FLAGGED_HIDDEN' | 'BLOCKED';
  isHarmful: boolean;
  category: 'none' | 'cyberbullying' | 'harassment' | 'hate_speech' | 'shaming' | 'threat' | 'curse_words_profanity' | 'vulnerable_struggle';
  toxicityScore: number;
  detectedLanguage: string;
  reason: string;
  encouragementTip?: string;
  moderatedAt: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  moderation: ModerationResult;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  createdAt: string;
  hearts: number;
  reactions?: {
    hearts?: number;
    love?: number;
    notAlone?: number;
    inspired?: number;
    insightful?: number;
  };
  comments: Comment[];
  moderation: ModerationResult;
}

const DATA_FILE = path.resolve(__dirname, 'posts-store.json');

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'The exhausting race to look successful on LinkedIn',
    content: "I'm 26 and I catch myself spiraling every time I open career social media. Everyone seems to be 'thrilled to announce' promotions, Forbes 30u30 nominations, or seamless careers while I'm still trying to figure out what brings me genuine peace. Last week I decided to step away from mindless networking and set boundaries on work hours. Sharing this because if you feel behind, you are really not alone. Life isn't a synchronized race.",
    author: 'QuietSeeker',
    category: 'Social Pressure',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    hearts: 42,
    moderation: {
      status: 'APPROVED',
      isHarmful: false,
      category: 'vulnerable_struggle',
      toxicityScore: 0,
      detectedLanguage: 'English',
      reason: 'Supportive, vulnerable sharing of personal struggle with career expectations.',
      encouragementTip: 'Thank you for your honesty—giving yourself grace is the first step to true peace.',
      moderatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    comments: [
      {
        id: 'c-1',
        author: 'GentleBreeze',
        content: 'I needed to read this today. Comparing our backstage to everyone else’s highlight reel is draining. Keep going at your own pace!',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        moderation: {
          status: 'APPROVED',
          isHarmful: false,
          category: 'none',
          toxicityScore: 0,
          detectedLanguage: 'English',
          reason: 'Uplifting and empathetic comment.',
          moderatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
      },
      {
        id: 'c-2',
        author: 'MountainHiker',
        content: 'Deleting those apps from my home screen helped my mental clarity more than any productivity guru ever could.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        moderation: {
          status: 'APPROVED',
          isHarmful: false,
          category: 'none',
          toxicityScore: 0,
          detectedLanguage: 'English',
          reason: 'Constructive personal tip.',
          moderatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      },
    ],
  },
  {
    id: 'post-2',
    title: 'Laban lang: overcoming family expectations and living my own dream',
    content: "Minsan ang bigat ng expectations ng pamilya. Lahat sila gustong maging accountant o engineer ako, pero ang totoo, passion ko talaga ang visual arts at teaching. Matagal akong natakot na ma-disappoint sila. Pero recently, I had a calm, respectful talk with my parents. It wasn't easy, but setting gentle boundaries was the best thing I did for my self-growth this year.",
    author: 'SinagNgAraw',
    category: 'Academic & Career',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    hearts: 54,
    moderation: {
      status: 'APPROVED',
      isHarmful: false,
      category: 'vulnerable_struggle',
      toxicityScore: 0,
      detectedLanguage: 'Tagalog / Filipino',
      reason: 'Honest personal journey regarding familial expectations and constructive dialogue.',
      encouragementTip: 'Mabuhay ang tapang mo! Choosing your genuine path with respect takes courage.',
      moderatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    comments: [
      {
        id: 'c-3',
        author: 'TalaMaynila',
        content: 'Sobrang ramdam kita. Proud of you for speaking your truth with respect!',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        moderation: {
          status: 'APPROVED',
          isHarmful: false,
          category: 'none',
          toxicityScore: 0,
          detectedLanguage: 'Tagalog / Filipino',
          reason: 'Supportive community encouragement.',
          moderatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        },
      },
    ],
  },
  {
    id: 'post-3',
    title: 'Learning that my body doesn’t exist to satisfy societal aesthetic standards',
    content: "Summer used to make me dread social gatherings because of unsolicited comments about weight from relatives and acquaintances. This year, I made a pact to celebrate my body for the breath it gives me, the places it carries me to, and the hugs it shares. Healing your relationship with self-image is non-linear, but it starts with speaking kindly to yourself in the mirror.",
    author: 'BloomInSilence',
    category: 'Self-Improvement',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    hearts: 67,
    moderation: {
      status: 'APPROVED',
      isHarmful: false,
      category: 'vulnerable_struggle',
      toxicityScore: 0,
      detectedLanguage: 'English',
      reason: 'Positive self-acceptance reflection fostering body kindness.',
      encouragementTip: 'Self-compassion is a superpower in a culture obsessed with vanity.',
      moderatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    comments: [],
  },
  {
    id: 'post-4',
    title: 'Apreniendo a decir "no" sin sentir culpa excesiva',
    content: "Siempre fui un 'people-pleaser'. Decía que sí a cualquier favor, a horas extras no pagadas, y a salidas que me dejaban exhausto solo para no incomodar. Mi terapeuta me enseñó que cada vez que digo 'sí' a otros por miedo, me estoy diciendo 'no' a mí mismo. Ha sido difícil, pero practicar límites pequeños me ha devuelto la tranquilidad.",
    author: 'CaminanteTranquilo',
    category: 'Mental Wellbeing',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    hearts: 38,
    moderation: {
      status: 'APPROVED',
      isHarmful: false,
      category: 'vulnerable_struggle',
      toxicityScore: 0,
      detectedLanguage: 'Spanish',
      reason: 'Healthy psychological reflection on setting interpersonal boundaries.',
      encouragementTip: 'Poner límites con amor es un acto de respeto hacia uno mismo y hacia los demás.',
      moderatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
    comments: [],
  },
];

// Cleanse stored posts and purge any comments containing curse words
function sanitizePosts(posts: Post[]): Post[] {
  return posts.map((post) => {
    // Ensure hearts property is present and numerical
    const heartsCount = typeof post.hearts === 'number' 
      ? post.hearts 
      : ((post as any).reactions?.love || (post as any).reactions?.notAlone || 0);

    // Filter out and automatically delete any comments with curse words or harmful content
    const sanitizedComments = (post.comments || []).filter((comment) => {
      if (!comment || !comment.content) return false;
      const detectedBad = detectCurseWordsAndBullying(comment.content);
      if (detectedBad && detectedBad.isBlocked) {
        return false; // automatically deleted
      }
      if (comment.moderation && comment.moderation.status === 'BLOCKED') {
        return false;
      }
      return true;
    });

    return {
      ...post,
      hearts: Math.max(0, heartsCount),
      comments: sanitizedComments,
    };
  });
}

function loadPosts(): Post[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      const sanitized = sanitizePosts(parsed);
      savePosts(sanitized);
      return sanitized;
    }
  } catch (err) {
    console.error('Error reading posts file, initializing with defaults:', err);
  }
  const sanitized = sanitizePosts(INITIAL_POSTS);
  savePosts(sanitized);
  return sanitized;
}

function savePosts(posts: Post[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing posts file:', err);
  }
}

let postsStore: Post[] = loadPosts();

// Intelligent multi-lingual moderation logic using Gemini AI + Zero-Tolerance Curse/Bullying Guard
async function moderateWithGemini(text: string, contextType: 'post' | 'comment'): Promise<ModerationResult> {
  const timestamp = new Date().toISOString();

  // 1. FAST ZERO-TOLERANCE PROFANITY & BULLYING CHECK FIRST
  const quickCheck = detectCurseWordsAndBullying(text);
  if (quickCheck && quickCheck.isBlocked) {
    return {
      status: 'BLOCKED',
      isHarmful: true,
      category: 'cyberbullying',
      toxicityScore: quickCheck.toxicityScore,
      detectedLanguage: quickCheck.language,
      reason: quickCheck.reason,
      encouragementTip: 'SafeSpace has zero tolerance for curse words, vulgarity, and bullying. Please express your thoughts respectfully.',
      moderatedAt: timestamp,
    };
  }

  // If no Gemini API key configured, use local rule-based safety evaluation
  if (!process.env.GEMINI_API_KEY) {
    return evaluateLocalFallback(text, timestamp);
  }

  try {
    const prompt = `You are the SafeSpace AI Content Guardian.
Your job is FULL ANALYSIS PROTECTION against cyberbullying, bad intentions, hostile statements, insults, demeaning words, invalidating sentence constructs, dismissive questioning, veiled profanity, and harassment in ANY language (English, Tagalog, Spanish, French, German, etc.).

Submission to analyze (${contextType}):
"""
${text}
"""

ZERO TOLERANCE RULES - MUST BE "BLOCKED" (isHarmful: true, status: "BLOCKED", category: "cyberbullying", toxicityScore: 85-100):
1. PROFANITY & CURSE WORDS: (e.g. "fuck", "shit", "bitch", "asshole", "puta", "gago", "tanga", "bobo", etc.).
2. INCOMPLETE, TRUNCATED, OR VEILED PROFANITY: (e.g. "what the", "what the...", "what the hell", "what the heck", "the hell", "tf", "wtf", "wth").
3. HOSTILE & INVALIDATING SENTENCE CONSTRUCTS & DISMISSIVE QUESTIONING:
   - Invalidation of identity, worth, or right to speak: "just who are you", "who do you think you are", "who even are you", "who are you", "who asked", "nobody asked", "who cares", "why are you here", "why post this", "sino ka ba", "a quién le importa".
   - Dismissive cynicism, scoffing, & trolling: "cope", "cry about it", "get a life", "touch grass", "grow up", "cringe", "so cringe", "delete this", "log off", "is this a joke", "stop whining", "drama queen".
4. PERSONAL ATTACKS, INSULTS & HOSTILE STATEMENTS: (e.g. "good for nothing", "loser", "freak", "waste of space", "nobody likes you", "you suck", "shut up", "idiot", "pathetic", "kys", "drop dead", "walang kwenta", "bueno para nada").

WHAT IS "APPROVED" (isHarmful: false, status: "APPROVED", toxicityScore: 0):
- Genuine, honest personal sharing of one's OWN emotional struggles, insecurities, self-improvement journey, mistakes, burnout, or overcoming social pressure (e.g., "I feel overwhelmed with work", "I struggled with family expectations").
- Kind, supportive, or empathetic comments encouraging the author (e.g., "Proud of you", "You are not alone", "Thank you for sharing").

If the text contains invalidating phrasing, dismissive sentence constructs, cynical sneering, or incomplete profanity, it MUST BE "BLOCKED".
Return JSON with status, isHarmful, category, toxicityScore, detectedLanguage, reason, encouragementTip.`;

    const geminiCall = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'You are an uncompromising fast content moderation system specializing in detecting cyberbullying, multi-lingual curse words, profanity, and toxic statements.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "Must be 'APPROVED', 'FLAGGED_HIDDEN', or 'BLOCKED'",
            },
            isHarmful: {
              type: Type.BOOLEAN,
              description: 'True if curse words, cyberbullying, hate speech, harassment, slurs, insults, or threats are detected.',
            },
            category: {
              type: Type.STRING,
              description: "One of: 'none', 'cyberbullying', 'harassment', 'hate_speech', 'shaming', 'threat', 'vulnerable_struggle'",
            },
            toxicityScore: {
              type: Type.INTEGER,
              description: 'Toxicity severity score from 0 (wholesome/safe) to 100 (extreme curse words/hate/violence/abuse)',
            },
            detectedLanguage: {
              type: Type.STRING,
              description: 'Detected language name, e.g. English, Tagalog, Spanish, French, etc.',
            },
            reason: {
              type: Type.STRING,
              description: 'Concise explanation of the moderation decision.',
            },
            encouragementTip: {
              type: Type.STRING,
              description: 'A compassionate, brief uplifting message or tip.',
            },
          },
          required: ['status', 'isHarmful', 'category', 'toxicityScore', 'detectedLanguage', 'reason'],
        },
      },
    });

    // Enforce 6-second timeout for fast responses
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI moderation timeout')), 6000)
    );

    const response = await Promise.race([geminiCall, timeoutPromise]);

    const parsed = JSON.parse(response.text || '{}');
    const statusUpper = (parsed.status || '').toUpperCase().trim();
    const isHarmfulBool = Boolean(parsed.isHarmful);
    const toxicity = typeof parsed.toxicityScore === 'number' ? parsed.toxicityScore : (isHarmfulBool ? 90 : 0);

    let status: 'APPROVED' | 'FLAGGED_HIDDEN' | 'BLOCKED' = 'APPROVED';

    if (
      isHarmfulBool ||
      toxicity >= 40 ||
      statusUpper === 'BLOCKED' ||
      statusUpper === 'REJECTED' ||
      statusUpper.includes('BLOCK') ||
      statusUpper.includes('REJECT')
    ) {
      status = 'BLOCKED';
    } else if (
      statusUpper === 'FLAGGED_HIDDEN' ||
      statusUpper.includes('FLAG') ||
      statusUpper.includes('HIDDEN') ||
      toxicity >= 20
    ) {
      status = 'FLAGGED_HIDDEN';
    } else {
      status = 'APPROVED';
    }

    // Double check with zero-tolerance profanity guard in case LLM slipped
    const postLLMCheck = detectCurseWordsAndBullying(text);
    if (postLLMCheck && postLLMCheck.isBlocked) {
      status = 'BLOCKED';
      parsed.isHarmful = true;
      parsed.toxicityScore = Math.max(toxicity, postLLMCheck.toxicityScore);
      parsed.reason = postLLMCheck.reason;
    }

    const finalHarmful = status === 'BLOCKED';

    return {
      status,
      isHarmful: finalHarmful,
      category: parsed.category || (finalHarmful ? 'cyberbullying' : 'none'),
      toxicityScore: status === 'BLOCKED' ? Math.max(toxicity, 85) : toxicity,
      detectedLanguage: parsed.detectedLanguage || 'English',
      reason: parsed.reason || (status === 'BLOCKED' ? 'Detected harmful or hostile language prohibited by SafeSpace rules.' : 'Content reviewed for community safety.'),
      encouragementTip: parsed.encouragementTip,
      moderatedAt: timestamp,
    };
  } catch (err) {
    // Falls back immediately to the ultra-fast local multi-lingual heuristic
    return evaluateLocalFallback(text, timestamp);
  }
}

// Local fallback heuristics if Gemini API call fails
function evaluateLocalFallback(text: string, timestamp: string): ModerationResult {
  const check = detectCurseWordsAndBullying(text);
  if (check && check.isBlocked) {
    return {
      status: 'BLOCKED',
      isHarmful: true,
      category: 'cyberbullying',
      toxicityScore: check.toxicityScore,
      detectedLanguage: check.language,
      reason: check.reason,
      encouragementTip: 'SafeSpace is dedicated to uplifting one another. Please express your thoughts constructively without curse words or personal attacks.',
      moderatedAt: timestamp,
    };
  }

  return {
    status: 'APPROVED',
    isHarmful: false,
    category: 'none',
    toxicityScore: 0,
    detectedLanguage: 'Detected Multi-lingual',
    reason: 'Content complies with SafeSpace guidelines. Safe and constructive for community sharing.',
    encouragementTip: 'Thank you for contributing to an empathetic environment.',
    moderatedAt: timestamp,
  };
}

// API Endpoints

// 1. Get all posts (with bad comments cleansed)
app.get('/api/posts', (_req, res) => {
  postsStore = sanitizePosts(postsStore);
  res.json({ success: true, posts: postsStore });
});

// 2. Pre-check moderation (live preview for user & AI Scanner Lab)
app.post('/api/moderate', async (req, res) => {
  try {
    const { text, type = 'post' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for moderation' });
      return;
    }
    const result = await moderateWithGemini(text, type);
    res.json({ success: true, moderation: result });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Moderation check failed' });
  }
});

// 3. Create a new anonymous post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author, category } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const trimmedAuthor = (author && typeof author === 'string' && author.trim()) ? author.trim().slice(0, 40) : 'AnonymousSoul';
    const trimmedTitle = title.trim().slice(0, 140);
    const trimmedContent = content.trim();

    // Check author name for curse words/slurs
    const authorCheck = detectCurseWordsAndBullying(trimmedAuthor);
    if (authorCheck && authorCheck.isBlocked) {
      res.status(400).json({
        error: 'The chosen author name contains prohibited language or curse words.',
        moderation: {
          status: 'BLOCKED',
          isHarmful: true,
          category: 'cyberbullying',
          toxicityScore: authorCheck.toxicityScore,
          detectedLanguage: authorCheck.language,
          reason: authorCheck.reason,
          moderatedAt: new Date().toISOString(),
        },
      });
      return;
    }

    // Run Gemini AI moderation on the post
    const textToModerate = `Title: ${trimmedTitle}\n\nStory: ${trimmedContent}`;
    const moderation = await moderateWithGemini(textToModerate, 'post');

    if (moderation.status === 'BLOCKED' || moderation.isHarmful) {
      res.status(400).json({
        error: 'Your post was not published because it contains prohibited curse words, cyberbullying, or harmful statements.',
        moderation,
      });
      return;
    }

    const newPost: Post = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: trimmedTitle,
      content: trimmedContent,
      author: trimmedAuthor,
      category: category || 'Social Pressure',
      createdAt: new Date().toISOString(),
      hearts: 0,
      comments: [],
      moderation,
    };

    postsStore.unshift(newPost);
    savePosts(postsStore);

    res.status(201).json({ success: true, post: newPost });
  } catch (err: any) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err?.message || 'Failed to create post' });
  }
});

// 4. Add comment to post (Auto-delete and block if contains curse words or bad statements)
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const { author, content } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'Comment content is required' });
      return;
    }

    const post = postsStore.find((p) => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const trimmedAuthor = (author && typeof author === 'string' && author.trim()) ? author.trim().slice(0, 40) : 'SupportiveVisitor';
    const trimmedContent = content.trim();

    // Moderate author handle with fast curse & bullying detector
    const authorCheck = detectCurseWordsAndBullying(trimmedAuthor);
    if (authorCheck && authorCheck.isBlocked) {
      res.status(400).json({
        error: 'The chosen name contains inappropriate language or curse words.',
        moderation: {
          status: 'BLOCKED',
          isHarmful: true,
          category: 'cyberbullying',
          toxicityScore: authorCheck.toxicityScore,
          detectedLanguage: authorCheck.language,
          reason: authorCheck.reason,
          moderatedAt: new Date().toISOString(),
        },
      });
      return;
    }

    // Moderate comment content with Gemini AI & Zero-Tolerance Profanity Guard
    const moderation = await moderateWithGemini(trimmedContent, 'comment');

    if (moderation.status === 'BLOCKED' || moderation.isHarmful) {
      // Disallow and auto-delete: do NOT add to comments
      res.status(400).json({
        error: 'Your comment was blocked and deleted because curse words and hostile statements are not allowed.',
        moderation,
      });
      return;
    }

    const newComment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: trimmedAuthor,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
      moderation,
    };

    post.comments.push(newComment);
    savePosts(postsStore);

    res.status(201).json({ success: true, comment: newComment });
  } catch (err: any) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: err?.message || 'Failed to submit comment' });
  }
});

// 5. Single Heart React Button: Toggle Heart / Unheart
app.post('/api/posts/:id/react', (req, res) => {
  try {
    const postId = req.params.id;
    const { action } = req.body; // 'heart' | 'unheart'

    const post = postsStore.find((p) => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (typeof post.hearts !== 'number') {
      post.hearts = (post as any).reactions?.love || (post as any).reactions?.notAlone || 0;
    }

    if (action === 'unheart') {
      post.hearts = Math.max(0, post.hearts - 1);
    } else {
      post.hearts += 1;
    }

    savePosts(postsStore);

    res.json({ success: true, hearts: post.hearts });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to record reaction' });
  }
});

// 6. Delete or report a post (for safety controls)
app.post('/api/posts/:id/report', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = postsStore.find((p) => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Re-verify with high sensitivity
    const check = await moderateWithGemini(post.title + '\n' + post.content, 'post');
    if (check.isHarmful || check.status === 'BLOCKED') {
      post.moderation = check;
      savePosts(postsStore);
    }

    res.json({ success: true, message: 'Thank you. The report has been evaluated by SafeSpace AI.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Report processing failed' });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SafeSpace server running at http://0.0.0.0:${PORT} [mode: ${isProd ? 'production' : 'development'}]`);
  });
}

startServer();
