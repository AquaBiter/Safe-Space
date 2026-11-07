import React, { useState, useEffect } from 'react';
import { Send, ShieldCheck, AlertTriangle, Eye, EyeOff, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Comment, ModerationResult } from '../types';
import { getAvatarStyle, getInitials, getRandomPseudonym, formatTimeAgo } from '../utils/avatars';
import { addFirestoreComment, subscribeToPostComments } from '../lib/firestoreService';

interface CommentSectionProps {
  postId: string;
  comments?: Comment[];
  onCommentAdded?: (postId: string, comment: Comment) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments: initialComments = [],
  onCommentAdded,
}) => {
  const [author, setAuthor] = useState(() => getRandomPseudonym());
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockedAlert, setBlockedAlert] = useState<ModerationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveComments, setLiveComments] = useState<Comment[]>(initialComments);

  // Track which hidden comments the user has opted to reveal
  const [revealedCommentIds, setRevealedCommentIds] = useState<Record<string, boolean>>({});

  // Subscribe to live comments in Firestore for this post
  useEffect(() => {
    const unsubscribe = subscribeToPostComments(
      postId,
      (updatedComments) => {
        setLiveComments(updatedComments);
      },
      (err) => {
        console.warn('Comments listener note:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [postId]);

  const handleShuffle = () => {
    setAuthor(getRandomPseudonym());
  };

  const toggleReveal = (commentId: string) => {
    setRevealedCommentIds((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setBlockedAlert(null);
    setErrorMessage(null);

    try {
      // 1. Moderate comment with live Gemini AI Cyberbullying Guard
      const modRes = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content.trim(),
          type: 'comment',
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
        reason: 'Community comment',
        moderatedAt: new Date().toISOString(),
      };

      if (moderation.status === 'BLOCKED' || moderation.isHarmful) {
        setBlockedAlert(moderation);
        setErrorMessage('Your comment was blocked because curse words, hostile statements, and bullying are strictly prohibited.');
        setIsSubmitting(false);
        return;
      }

      // 2. Persist live directly to Firestore on project safespace-web-23d8e
      const authorName = author.trim() || 'SupportiveVisitor';
      const commentId = await addFirestoreComment(postId, {
        author: authorName,
        content: content.trim(),
        moderation,
      });

      const newComment: Comment = {
        id: commentId,
        author: authorName,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        moderation,
      };

      if (onCommentAdded) {
        onCommentAdded(postId, newComment);
      }

      setContent('');
      setAuthor(getRandomPseudonym());
    } catch (err: any) {
      console.error('Comment submission error:', err);
      setErrorMessage(err?.message || 'Network error while posting comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayComments = liveComments.length > 0 ? liveComments : initialComments;

  return (
    <div className="pt-4 mt-4 border-t border-stone-200/80 space-y-4">
      {/* Existing Comments List */}
      <div className="space-y-3">
        {displayComments.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-2">
            No reflections yet. Be the first to share an encouraging word!
          </p>
        ) : (
          displayComments.map((comment) => {
            const avatar = getAvatarStyle(comment.author);
            const isHidden =
              comment.moderation?.status === 'FLAGGED_HIDDEN' &&
              !revealedCommentIds[comment.id];

            return (
              <div
                key={comment.id}
                className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/70 text-xs space-y-1.5 transition-all"
              >
                {/* Comment Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[10px] border ${avatar.bg}`}
                    >
                      {getInitials(comment.author)}
                    </div>
                    <span className="font-medium text-stone-800">
                      {comment.author}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-stone-400">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>

                  {/* AI Safety indicator */}
                  <div className="flex items-center gap-1 text-[11px] text-stone-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>AI Checked</span>
                    {comment.moderation?.detectedLanguage && (
                      <span className="text-stone-400 hidden sm:inline">
                        ({comment.moderation.detectedLanguage})
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment Body */}
                {isHidden ? (
                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Comment shielded by AI Guardian</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      {comment.moderation?.reason || 'Sensitive tone detected.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleReveal(comment.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 underline pt-0.5"
                    >
                      <Eye className="w-3 h-3" />
                      View shielded comment
                    </button>
                  </div>
                ) : (
                  <div>
                    {comment.moderation?.status === 'FLAGGED_HIDDEN' && (
                      <div className="flex items-center justify-between text-[11px] text-amber-700 pb-1">
                        <span className="italic">Revealed comment</span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(comment.id)}
                          className="inline-flex items-center gap-0.5 underline text-[10px]"
                        >
                          <EyeOff className="w-2.5 h-2.5" /> Re-hide
                        </button>
                      </div>
                    )}
                    <p className="text-stone-700 whitespace-pre-line leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Blocked Moderation Alert Banner */}
      {blockedAlert && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Comment Blocked by Cyberbullying Guard</span>
          </div>
          <p className="text-rose-700 leading-normal">
            {blockedAlert.reason}
          </p>
          <div className="text-[11px] text-rose-800/80 pt-0.5">
            SafeSpace automatically deletes comments containing profanity, hostile questioning, dismissive sneers, or cyberbullying. Please keep responses empathetic.
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {errorMessage && !blockedAlert && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Add Comment Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>Commenting as:</span>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={30}
              className="px-2 py-0.5 rounded border border-stone-200 bg-white text-stone-800 font-medium text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleShuffle}
              className="p-1 text-stone-400 hover:text-stone-600"
              title="Shuffle alias"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[11px] text-emerald-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Live AI Cyberbullying Guard
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a supportive or thoughtful anonymous comment..."
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
