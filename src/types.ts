export interface ModerationResult {
  status: 'APPROVED' | 'FLAGGED_HIDDEN' | 'BLOCKED';
  isHarmful: boolean;
  category: 'none' | 'cyberbullying' | 'harassment' | 'hate_speech' | 'shaming' | 'threat' | 'curse_words_profanity' | 'vulnerable_struggle';
  toxicityScore: number; // 0 - 100
  detectedLanguage: string;
  reason: string;
  encouragementTip?: string;
  moderatedAt: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  authorId?: string;
  moderation: ModerationResult;
  revealed?: boolean;
}

export type PostCategory = 
  | 'Social Pressure'
  | 'Self-Improvement'
  | 'Academic & Career'
  | 'Mental Wellbeing'
  | 'Vulnerability & Healing'
  | 'General Reflection';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: PostCategory;
  createdAt: string;
  authorId?: string;
  hearts: number; // Single heart count
  reactions?: {
    hearts?: number;
    love?: number;
    notAlone?: number;
    inspired?: number;
    insightful?: number;
  };
  comments: Comment[];
  moderation: ModerationResult;
  revealed?: boolean;
}

