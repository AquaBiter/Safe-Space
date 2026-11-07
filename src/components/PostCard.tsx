import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Eye, EyeOff, MessageCircle, Heart, Sparkles, Flag, Check } from 'lucide-react';
import { Post, Comment } from '../types';
import { getAvatarStyle, getInitials, formatTimeAgo } from '../utils/avatars';
import { CommentSection } from './CommentSection';
import { subscribeToPostComments } from '../lib/firestoreService';

interface PostCardProps {
  post: Post;
  isHearted: boolean;
  onToggleHeart: (postId: string) => void;
  onCommentAdded?: (postId: string, comment: Comment) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isHearted,
  onToggleHeart,
  onCommentAdded,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reported, setReported] = useState(false);
  const [liveCommentsCount, setLiveCommentsCount] = useState(post.comments?.length || 0);

  // Keep comment count synchronized live with Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPostComments(
      post.id,
      (comments) => {
        setLiveCommentsCount(comments.length);
      },
      () => {
        // silent fallback
      }
    );
    return () => {
      unsubscribe();
    };
  }, [post.id]);

  const avatar = getAvatarStyle(post.author);
  const isHidden = post.moderation?.status === 'FLAGGED_HIDDEN' && !isRevealed;

  const handleReport = async () => {
    if (reported) return;
    try {
      await fetch(`/api/posts/${post.id}/report`, { method: 'POST' });
      setReported(true);
      setTimeout(() => setReported(false), 5000);
    } catch {
      // ignore
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-stone-300 transition-all p-5 sm:p-6 space-y-4">
      {/* Top Author & Metadata Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${avatar.bg}`}
          >
            {getInitials(post.author)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-stone-900">
                {post.author}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-medium">
                {post.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI Moderated</span>
              </span>
              {post.moderation?.detectedLanguage && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-400">
                    {post.moderation.detectedLanguage}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Report / Safety button */}
        <button
          type="button"
          onClick={handleReport}
          className="text-stone-400 hover:text-stone-600 p-1.5 rounded-md hover:bg-stone-100 transition-colors text-xs flex items-center gap-1"
          title="Flag for AI re-evaluation"
        >
          {reported ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <Check className="w-3.5 h-3.5" /> Checked
            </span>
          ) : (
            <Flag className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Flagged / Hidden Shield State */}
      {isHidden ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Content Hidden by AI Safety Guard</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {post.moderation?.reason ||
              'This post has been shielded because it contains sensitive or potentially hostile language.'}
          </p>
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 underline pt-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Reveal post anyway
          </button>
        </div>
      ) : (
        /* Regular Post Body */
        <div className="space-y-2.5">
          {post.moderation?.status === 'FLAGGED_HIDDEN' && isRevealed && (
            <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-200/50 mb-2">
              <span className="inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Shielded content revealed
              </span>
              <button
                type="button"
                onClick={() => setIsRevealed(false)}
                className="inline-flex items-center gap-1 text-[11px] underline"
              >
                <EyeOff className="w-3 h-3" /> Hide again
              </button>
            </div>
          )}

          <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
            {post.title}
          </h2>

          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line font-sans">
            {post.content}
          </p>

          {/* AI Guardian Affirmation Tip */}
          {post.moderation?.encouragementTip && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/90 text-xs text-emerald-900 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-emerald-800 mr-1">
                  SafeSpace Guardian:
                </span>
                <span className="italic text-emerald-950">
                  "{post.moderation.encouragementTip}"
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reaction and Interactive Controls: Single Heart Button & Comments Toggle */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        {/* Single Heart Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleHeart(post.id)}
          className={`group inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all active:scale-95 ${
            isHearted
              ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-xs ring-1 ring-rose-200'
              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-rose-50/60 hover:text-rose-700 hover:border-rose-200'
          }`}
          title={isHearted ? 'Click to unheart' : 'Heart this post'}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              isHearted
                ? 'text-rose-600 fill-rose-600 scale-110'
                : 'text-stone-400 group-hover:text-rose-500'
            }`}
          />
          <span>{isHearted ? 'Hearted' : 'Heart'}</span>
          <span className="font-bold ml-0.5">{post.hearts}</span>
        </button>

        {/* Comment Drawer Toggle */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            showComments
              ? 'bg-stone-200 border-stone-300 text-stone-900'
              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-stone-500" />
          <span>
            {liveCommentsCount}{' '}
            {liveCommentsCount === 1 ? 'Comment' : 'Comments'}
          </span>
        </button>
      </div>

      {/* Expanded Comments Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={post.comments}
          onCommentAdded={onCommentAdded}
        />
      )}
    </article>
  );
};
