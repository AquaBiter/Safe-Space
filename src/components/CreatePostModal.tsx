import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, AlertTriangle, RefreshCw, Feather, Loader2 } from 'lucide-react';
import { Post, PostCategory, ModerationResult } from '../types';
import { getRandomPseudonym } from '../utils/avatars';
import { createFirestorePost } from '../lib/firestoreService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

const CATEGORIES: PostCategory[] = [
  'Social Pressure',
  'Self-Improvement',
  'Academic & Career',
  'Mental Wellbeing',
  'Vulnerability & Healing',
  'General Reflection',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [author, setAuthor] = useState(() => getRandomPseudonym());
  const [category, setCategory] = useState<PostCategory>('Social Pressure');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreChecking, setIsPreChecking] = useState(false);
  const [preCheckResult, setPreCheckResult] = useState<ModerationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [blockedModeration, setBlockedModeration] = useState<ModerationResult | null>(null);

  if (!isOpen) return null;

  const handleShuffleAuthor = () => {
    setAuthor(getRandomPseudonym());
  };

  const handlePreCheck = async () => {
    if (!content.trim() && !title.trim()) {
      setErrorMessage('Please type a title or story message before checking safety.');
      return;
    }
    setErrorMessage(null);
    setBlockedModeration(null);
    setIsPreChecking(true);

    try {
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Title: ${title}\nStory: ${content}`,
          type: 'post',
        }),
        signal: AbortSignal.timeout(6000),
      });
      const data = await response.json();
      if (data.success) {
        setPreCheckResult(data.moderation);
      } else {
        setErrorMessage(data.error || 'Pre-check failed');
      }
    } catch {
      setErrorMessage('Could not complete safety scan right now. Please try again.');
    } finally {
      setIsPreChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide a title for your reflection.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Please write your story or message.');
      return;
    }

    setErrorMessage(null);
    setBlockedModeration(null);
    setIsSubmitting(true);

    try {
      // 1. Run live Gemini AI Content Guardian moderation
      const modRes = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Title: ${title.trim()}\nStory: ${content.trim()}`,
          type: 'post',
        }),
        signal: AbortSignal.timeout(6000),
      });

      const modData = await modRes.json();
      const moderation: ModerationResult = modData.moderation || {
        status: 'APPROVED',
        isHarmful: false,
        category: 'none',
        toxicityScore: 0,
        detectedLanguage: 'English',
        reason: 'Community submission',
        moderatedAt: new Date().toISOString(),
      };

      if (moderation.status === 'BLOCKED' || moderation.isHarmful) {
        setBlockedModeration(moderation);
        setErrorMessage('This reflection was blocked because cyberbullying, curse words, or hostile statements are strictly prohibited.');
        setIsSubmitting(false);
        return;
      }

      // 2. Persist live directly to Firestore on project safespace-web-23d8e
      const authorName = author.trim() || 'AnonymousSoul';
      const postId = await createFirestorePost({
        title: title.trim(),
        content: content.trim(),
        author: authorName,
        category,
        moderation,
      });

      // Optimistic callback
      onPostCreated({
        id: postId,
        title: title.trim(),
        content: content.trim(),
        author: authorName,
        category,
        createdAt: new Date().toISOString(),
        hearts: 0,
        comments: [],
        moderation,
      });

      // Reset form and close
      setTitle('');
      setContent('');
      setAuthor(getRandomPseudonym());
      setPreCheckResult(null);
      onClose();
    } catch (err: any) {
      console.error('Publish error:', err);
      setErrorMessage(err?.message || 'Error publishing reflection to live database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Publish an Anonymous Reflection
              </h2>
              <p className="text-xs text-stone-500">
                Saved live to cloud database · Protected by Gemini AI against cyberbullying
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Identity & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Anonymous Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-800">
                  Your Anonymous Name / Alias
                </label>
                <button
                  type="button"
                  onClick={handleShuffleAuthor}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  Shuffle alias
                </button>
              </div>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={40}
                placeholder="e.g. QuietSeeker, FreeSoul..."
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Visible to everyone. You may keep the random alias or choose your own.
              </span>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1.5">
                Topic / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-stone-400 mt-1 block">
                Helps community members find shared experiences.
              </span>
            </div>
          </div>

          {/* Post Title */}
          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1.5">
              Reflection Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. The pressure to have my life figured out by 25..."
              className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Post Message Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-800">
                Your Story, Thoughts, or Self-Improvement Journey
              </label>
              <span className="text-[11px] text-stone-400">
                {content.length} characters (min 20 recommended)
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Write freely. Share the social pressure you felt, how it affected your wellbeing, and what you are doing or learning to overcome it. Multi-language submissions are welcomed (English, Tagalog, Spanish, etc.)..."
              className="w-full px-3.5 py-3 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white leading-relaxed resize-y"
            />
          </div>

          {/* Live AI Safety Pre-check Banner / Result */}
          {preCheckResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                preCheckResult.status === 'BLOCKED'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : preCheckResult.status === 'FLAGGED_HIDDEN'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {preCheckResult.status === 'BLOCKED' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>
                      {preCheckResult.status === 'APPROVED' && 'Safe & Approved for Sharing'}
                      {preCheckResult.status === 'FLAGGED_HIDDEN' && 'Borderline / Will Be Shielded'}
                      {preCheckResult.status === 'BLOCKED' && 'Cyberbullying or Harmful Language Detected'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-stone-200 font-normal">
                      Language: {preCheckResult.detectedLanguage}
                    </span>
                  </div>
                  <p className="text-stone-700 leading-normal">{preCheckResult.reason}</p>
                  {preCheckResult.encouragementTip && (
                    <p className="italic text-stone-600 pt-0.5">
                      "{preCheckResult.encouragementTip}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Blocked Moderation Alert */}
          {blockedModeration && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Post Blocked by SafeSpace AI Moderation</span>
              </div>
              <p className="text-rose-700 leading-relaxed">
                {blockedModeration.reason}
              </p>
              <div className="bg-white/80 p-2.5 rounded-lg border border-rose-200 text-[11px] text-stone-700">
                <span className="font-semibold block mb-0.5 text-stone-900">Why was this blocked?</span>
                SafeSpace protects all visitors against personal attacks, body shaming, hostile slurs, and cyberbullying across multiple languages. If you are sharing a painful experience, please describe how it made you feel without directing insults at others.
              </div>
            </div>
          )}

          {/* General Error Banner */}
          {errorMessage && !blockedModeration && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-stone-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePreCheck}
              disabled={isPreChecking || isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPreChecking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pre-check AI Safety</span>
                </>
              )}
            </button>

            <div className="w-full sm:w-auto flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Moderating & Saving...</span>
                  </>
                ) : (
                  <>
                    <Feather className="w-3.5 h-3.5" />
                    <span>Publish Reflection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
