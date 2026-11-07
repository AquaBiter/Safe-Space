import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  runTransaction,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, getVisitorId } from './firebase';
import { Post, Comment, PostCategory, ModerationResult } from '../types';

// Exactly 3 initial artificial already-made posts with likes and comments
export const INITIAL_THREE_POSTS: Array<{
  id: string;
  title: string;
  content: string;
  author: string;
  category: PostCategory;
  createdAt: string;
  hearts: number;
  moderation: ModerationResult;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: string;
    moderation: ModerationResult;
  }>;
}> = [
  {
    id: 'sample_post_1',
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
        id: 'c_1',
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
        id: 'c_2',
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
    id: 'sample_post_2',
    title: 'Learning that my body doesn’t exist to satisfy societal aesthetic standards',
    content: "Summer used to make me dread social gatherings because of unsolicited comments about weight from relatives and acquaintances. This year, I made a pact to celebrate my body for the breath it gives me, the places it carries me to, and the hugs it shares. Healing your relationship with self-image is non-linear, but it starts with speaking kindly to yourself in the mirror.",
    author: 'BloomInSilence',
    category: 'Self-Improvement',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    hearts: 67,
    moderation: {
      status: 'APPROVED',
      isHarmful: false,
      category: 'vulnerable_struggle',
      toxicityScore: 0,
      detectedLanguage: 'English',
      reason: 'Positive self-acceptance reflection fostering body kindness.',
      encouragementTip: 'Self-compassion is a superpower in a culture obsessed with vanity.',
      moderatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    comments: [
      {
        id: 'c_3',
        author: 'RadiantSoul',
        content: 'This touched my heart deeply. Unsolicited comments from relatives used to break me, but gentle boundaries changed my life.',
        createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
        moderation: {
          status: 'APPROVED',
          isHarmful: false,
          category: 'none',
          toxicityScore: 0,
          detectedLanguage: 'English',
          reason: 'Empathetic comment.',
          moderatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
        },
      },
      {
        id: 'c_4',
        author: 'MindfulEcho',
        content: 'Speaking kindly to yourself in the mirror is truly where the healing begins. Thank you for sharing this.',
        createdAt: new Date(Date.now() - 3600000 * 11).toISOString(),
        moderation: {
          status: 'APPROVED',
          isHarmful: false,
          category: 'none',
          toxicityScore: 0,
          detectedLanguage: 'English',
          reason: 'Supportive reflection.',
          moderatedAt: new Date(Date.now() - 3600000 * 11).toISOString(),
        },
      },
    ],
  },
  {
    id: 'sample_post_3',
    title: 'Overcoming academic burnout: choosing health over perfection',
    content: "For three semesters straight, I tied 100% of my self-worth to GPA and late-night cram sessions. When panic attacks started hitting during midterms, I finally admitted that burning out is not a badge of honor. I took a lighter course load, started morning walks, and reached out to a counselor. Healing takes patience, but learning to rest was the smartest move I ever made.",
    author: 'ResilientHeart',
    category: 'Academic & Career',
    createdAt: new Date(Date.now() - 3600000 * 32).toISOString(),
    hearts: 58,
    moderation: {
      status: 'APPROVED',
      isHarmful: false,
      category: 'vulnerable_struggle',
      toxicityScore: 0,
      detectedLanguage: 'English',
      reason: 'Constructive vulnerability and overcoming academic burnout.',
      encouragementTip: 'Rest is not a reward—it is an essential foundation for long-term health.',
      moderatedAt: new Date(Date.now() - 3600000 * 32).toISOString(),
    },
    comments: [
      {
        id: 'c_5',
        author: 'CalmCurrent',
        content: 'Burning out is definitely not a badge of honor. Proud of you for choosing your mental health!',
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        moderation: {
          status: 'APPROVED',
          isHarmful: false,
          category: 'none',
          toxicityScore: 0,
          detectedLanguage: 'English',
          reason: 'Encouraging response.',
          moderatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        },
      },
      {
        id: 'c_6',
        author: 'SkyGazer',
        content: 'Rest is productive. It took me years to realize that rest is vital maintenance, not laziness.',
        createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
        moderation: {
          status: 'APPROVED',
          isHarmful: false,
          category: 'none',
          toxicityScore: 0,
          detectedLanguage: 'English',
          reason: 'Constructive insight.',
          moderatedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
        },
      },
    ],
  },
];

// One-time idempotent boot seeding to avoid any recursive loops or flickering
let hasInitiatedSeed = false;
export async function ensureSeedPosts(): Promise<void> {
  if (hasInitiatedSeed) return;
  hasInitiatedSeed = true;

  try {
    const snap = await getDocs(query(collection(db, 'posts'), limit(1)));
    if (snap.empty) {
      console.log('Populating 3 initial community posts into Firestore...');
      const visitorId = getVisitorId();
      for (const p of INITIAL_THREE_POSTS) {
        const { comments, ...postDoc } = p;
        await setDoc(doc(db, 'posts', p.id), {
          ...postDoc,
          authorId: visitorId,
        });

        for (const c of comments) {
          await setDoc(doc(db, 'posts', p.id, 'comments', c.id), {
            ...c,
            authorId: visitorId,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Initial seed note (non-critical):', err);
  }
}

/**
 * Subscribe to all posts in real-time.
 * Strictly passive listener: does NOT trigger writes inside the callback.
 */
export function subscribeToPosts(
  onUpdate: (posts: Post[]) => void,
  onError?: (error: Error) => void
): () => void {
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));

  const unsubscribe = onSnapshot(
    postsQuery,
    (snapshot) => {
      const postsList: Post[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        postsList.push({
          id: docSnap.id,
          title: data.title || '',
          content: data.content || '',
          author: data.author || 'Anonymous',
          category: data.category || 'General Reflection',
          createdAt: data.createdAt || new Date().toISOString(),
          hearts: typeof data.hearts === 'number' ? data.hearts : 0,
          authorId: data.authorId,
          comments: [],
          moderation: data.moderation || {
            status: 'APPROVED',
            isHarmful: false,
            category: 'none',
            toxicityScore: 0,
            detectedLanguage: 'English',
            reason: 'Community post',
            moderatedAt: new Date().toISOString(),
          },
        });
      });

      onUpdate(postsList);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'posts');
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to comments for a specific post in real-time.
 */
export function subscribeToPostComments(
  postId: string,
  onUpdate: (comments: Comment[]) => void,
  onError?: (error: Error) => void
): () => void {
  const commentsQuery = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  const unsubscribe = onSnapshot(
    commentsQuery,
    (snapshot) => {
      const commentsList: Comment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        commentsList.push({
          id: docSnap.id,
          author: data.author || 'SupportiveVisitor',
          content: data.content || '',
          createdAt: data.createdAt || new Date().toISOString(),
          authorId: data.authorId,
          moderation: data.moderation || {
            status: 'APPROVED',
            isHarmful: false,
            category: 'none',
            toxicityScore: 0,
            detectedLanguage: 'English',
            reason: 'Community comment',
            moderatedAt: new Date().toISOString(),
          },
        });
      });
      onUpdate(commentsList);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, `posts/${postId}/comments`);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );

  return unsubscribe;
}

/**
 * Create a new reflection post in Firestore with real-time sync.
 */
export async function createFirestorePost(postData: {
  title: string;
  content: string;
  author: string;
  category: PostCategory;
  moderation: ModerationResult;
}): Promise<string> {
  const visitorId = getVisitorId();
  const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const postDocRef = doc(db, 'posts', postId);

  const payload = {
    title: postData.title,
    content: postData.content,
    author: postData.author,
    category: postData.category,
    createdAt: new Date().toISOString(),
    authorId: visitorId,
    hearts: 0,
    moderation: postData.moderation,
  };

  try {
    await setDoc(postDocRef, payload);
    return postId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${postId}`);
  }
}

/**
 * Add a comment to a post in Firestore with live synchronization.
 */
export async function addFirestoreComment(
  postId: string,
  commentData: {
    author: string;
    content: string;
    moderation: ModerationResult;
  }
): Promise<string> {
  const visitorId = getVisitorId();
  const commentId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const commentDocRef = doc(db, 'posts', postId, 'comments', commentId);

  const payload = {
    author: commentData.author,
    content: commentData.content,
    createdAt: new Date().toISOString(),
    authorId: visitorId,
    moderation: commentData.moderation,
  };

  try {
    await setDoc(commentDocRef, payload);
    return commentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${postId}/comments/${commentId}`);
  }
}

/**
 * Toggle heart reaction live in Firestore.
 */
export async function toggleFirestoreHeart(
  postId: string,
  currentlyHearted: boolean
): Promise<boolean> {
  const visitorId = getVisitorId();
  const postRef = doc(db, 'posts', postId);
  const heartRef = doc(db, 'posts', postId, 'hearts', visitorId);

  try {
    if (currentlyHearted) {
      // Unheart
      await deleteDoc(heartRef);
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (postDoc.exists()) {
          const currentHearts = postDoc.data().hearts || 0;
          transaction.update(postRef, {
            hearts: Math.max(0, currentHearts - 1),
          });
        }
      });
      return false;
    } else {
      // Heart
      await setDoc(heartRef, {
        userId: visitorId,
        createdAt: new Date().toISOString(),
      });
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (postDoc.exists()) {
          const currentHearts = postDoc.data().hearts || 0;
          transaction.update(postRef, {
            hearts: currentHearts + 1,
          });
        }
      });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
  }
}
