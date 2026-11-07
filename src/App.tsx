/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { ModerationGuideModal } from './components/ModerationGuideModal';
import { CrisisSupportModal } from './components/CrisisSupportModal';
import { Post, Comment, PostCategory } from './types';
import { Search, SlidersHorizontal, Plus, Loader2, HeartHandshake, Wifi, AlertCircle } from 'lucide-react';
import { testConnection } from './lib/firebase';
import { subscribeToPosts, toggleFirestoreHeart, ensureSeedPosts } from './lib/firestoreService';

const CATEGORIES: ('All' | PostCategory)[] = [
  'All',
  'Social Pressure',
  'Self-Improvement',
  'Academic & Career',
  'Mental Wellbeing',
  'Vulnerability & Healing',
  'General Reflection',
];

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // User's hearted posts persisted in localStorage
  const [userHeartedMap, setUserHeartedMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('safespace_user_hearts');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Filters & Controls
  const [selectedCategory, setSelectedCategory] = useState<'All' | PostCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'hearts' | 'comments'>('recent');

  // Test Firebase connection & seed 3 artificial posts if database is empty
  useEffect(() => {
    testConnection();
    ensureSeedPosts();
  }, []);

  // Subscribe to live Firestore posts stream
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToPosts(
      (livePosts) => {
        setPosts(livePosts);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setIsLoading(false);
        if (err.message && err.message.includes('Quota exceeded')) {
          setQuotaExceeded(true);
        } else {
          setError('Could not connect to live database. Retrying automatically...');
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePostCreated = (newPost: Post) => {
    // Optimistically prepend; Firestore onSnapshot will maintain exact sync
    setPosts((prev) => {
      if (prev.some((p) => p.id === newPost.id)) return prev;
      return [newPost, ...prev];
    });
  };

  const handleCommentAdded = (postId: string, newComment: Comment) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      })
    );
  };

  // Live heart reaction toggle handler
  const handleToggleHeart = async (postId: string) => {
    const isCurrentlyHearted = Boolean(userHeartedMap[postId]);

    // Update local state map
    const updatedMap = {
      ...userHeartedMap,
      [postId]: !isCurrentlyHearted,
    };
    if (isCurrentlyHearted) {
      delete updatedMap[postId];
    }
    setUserHeartedMap(updatedMap);
    try {
      localStorage.setItem('safespace_user_hearts', JSON.stringify(updatedMap));
    } catch {
      // ignore
    }

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const currentHearts = typeof p.hearts === 'number' ? p.hearts : 0;
          return {
            ...p,
            hearts: isCurrentlyHearted ? Math.max(0, currentHearts - 1) : currentHearts + 1,
          };
        }
        return p;
      })
    );

    // Save live to Firestore database on safespace-web-23d8e
    try {
      await toggleFirestoreHeart(postId, isCurrentlyHearted);
    } catch (err: any) {
      console.error('Heart sync error:', err);
      if (err?.message?.includes('Quota exceeded')) {
        setQuotaExceeded(true);
      }
    }
  };

  // Filter and sort reflections
  const filteredAndSortedPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesCategory =
          selectedCategory === 'All' || post.category === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'hearts') {
          return (b.hearts || 0) - (a.hearts || 0);
        }
        if (sortBy === 'comments') {
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        }
        // 'recent'
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [posts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <Header
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

      {/* Hero */}
      <Hero
        onOpenCreate={() => setIsCreateOpen(true)}
        postCount={posts.length}
      />

      {/* Live sync indicator & Quota notice banner */}
      {quotaExceeded && (
        <div className="bg-amber-500 text-stone-900 px-4 py-2.5 text-xs font-medium text-center border-b border-amber-600 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-stone-950 shrink-0" />
          <span>
            Database free daily quota limit reached. Quota resets daily. You can upgrade your Firestore plan in your Firebase Console if needed.
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Live sync pill badge */}
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5 font-medium text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Wifi className="w-3.5 h-3.5" />
            <span>Live Firestore Sync (safespace-web-23d8e)</span>
          </div>
          <span className="text-stone-400">
            {posts.length} {posts.length === 1 ? 'reflection' : 'reflections'} online
          </span>
        </div>

        {/* Filter Bar & Search */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reflections (e.g. imposter syndrome, career, burnout)..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs text-stone-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              >
                <option value="recent">Most Recent</option>
                <option value="hearts">Most Hearted</option>
                <option value="comments">Most Discussed (Comments)</option>
              </select>
            </div>
          </div>

          {/* Segmented Category Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100/80 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feed Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-emerald-700 animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-medium">
                Connecting to live SafeSpace database...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3 max-w-md mx-auto">
              <p className="text-xs text-rose-800 font-medium">{error}</p>
            </div>
          ) : filteredAndSortedPosts.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-stone-300 text-center space-y-3 bg-white/50">
              <HeartHandshake className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-serif font-bold text-stone-800">
                No reflections found in this category
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Be the first to share an honest reflection or self-growth journey.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Write First Reflection
              </button>
            </div>
          ) : (
            filteredAndSortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isHearted={Boolean(userHeartedMap[post.id])}
                onToggleHeart={handleToggleHeart}
                onCommentAdded={handleCommentAdded}
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button
        type="button"
        onClick={() => setIsCreateOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-40 p-4 rounded-full bg-emerald-700 text-white shadow-xl hover:bg-emerald-800 active:scale-95 transition-all flex items-center justify-center"
        title="Share your reflection"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <ModerationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <CrisisSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-stone-100/70 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-800">SafeSpace</span>
            <span>·</span>
            <span>A compassionate, anonymous community blog</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
