import { useState, useCallback, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import StoryBar from '@/components/StoryBar';
import PostCard from '@/components/PostCard';
import { get } from '@/lib/api';
import type { Post } from '@/types';

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full animate-shimmer" />
        <div className="flex-1">
          <div className="w-24 h-3 rounded animate-shimmer mb-2" />
          <div className="w-16 h-2 rounded animate-shimmer" />
        </div>
      </div>
      <div className="w-full h-3 rounded animate-shimmer mb-2" />
      <div className="w-3/4 h-3 rounded animate-shimmer mb-3" />
      <div className="w-full h-48 rounded-xl animate-shimmer" />
    </div>
  );
}

function mapApiPost(p: any): Post {
  return {
    id: p.id,
    userId: p.user_id,
    user: {
      id: p.user_id,
      username: p.username,
      email: '',
      avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`,
      bio: '',
      coverImage: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isVerified: !!p.is_verified,
    },
    content: p.content,
    images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []),
    likesCount: p.like_count || 0,
    commentsCount: p.comment_count || 0,
    sharesCount: p.share_count || 0,
    isLiked: !!p.is_liked,
    isBookmarked: !!p.is_bookmarked,
    createdAt: p.created_at,
  };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchPosts = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      const res = await get<{ success: boolean; data: { posts: any[]; pagination: { total: number; totalPages: number } } }>(`/posts/feed?page=${pageNum}&limit=10`);
      const mapped = (res.data?.posts || []).map(mapApiPost);
      if (append) {
        setPosts((prev) => [...prev, ...mapped]);
      } else {
        setPosts(mapped);
      }
      const pagination = res.data?.pagination;
      setHasMore(pagination ? pageNum < pagination.totalPages : mapped.length >= 10);
    } catch {
      if (!append) {
        setPosts([]);
      }
    }
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      await fetchPosts(1);
      setIsLoading(false);
    };
    loadInitial();
  }, [fetchPosts]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    await fetchPosts(1);
    setIsRefreshing(false);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage, true);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, page, fetchPosts]);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      });
      if (node) observerRef.current.observe(node);
    },
    [handleLoadMore]
  );

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 } : p))
    );
  };

  const handleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  };

  const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updates } : p)));
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">动态</h1>
        <button
          onClick={handleRefresh}
          className={cn('p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all', isRefreshing && 'animate-spin')}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {isRefreshing && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <StoryBar />

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <div key={post.id} ref={idx === posts.length - 1 ? lastPostRef : undefined}>
              <PostCard post={post} onLike={handleLike} onBookmark={handleBookmark} onUpdate={handlePostUpdate} />
            </div>
          ))}

          {isLoadingMore && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">没有更多动态了</div>
          )}

          {!isLoading && posts.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">暂无动态，去关注一些人或发布第一条动态吧～</div>
          )}
        </div>
      )}
    </div>
  );
}
