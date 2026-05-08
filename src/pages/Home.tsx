import { useState, useCallback, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import StoryBar from '@/components/StoryBar';
import PostCard from '@/components/PostCard';
import type { Post } from '@/types';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    user: { id: 'u1', username: '小红', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hong', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 },
    content: '今天阳光真好，出去散步了！🌸 享受这美好的周末时光～',
    images: ['https://picsum.photos/seed/p1/600/400'],
    likesCount: 42,
    commentsCount: 8,
    sharesCount: 3,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '2',
    user: { id: 'u2', username: '摄影师阿杰', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jie', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 },
    content: '日落时分的城市天际线，每一帧都是画 🌆',
    images: ['https://picsum.photos/seed/p2/600/400', 'https://picsum.photos/seed/p3/600/400'],
    likesCount: 128,
    commentsCount: 24,
    sharesCount: 15,
    isLiked: true,
    isBookmarked: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    user: { id: 'u3', username: '美食家小美', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mei', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 },
    content: '今天尝试了一家新开的日料店，三文鱼刺身超新鲜！🍣',
    images: ['https://picsum.photos/seed/p4/600/400', 'https://picsum.photos/seed/p5/600/400', 'https://picsum.photos/seed/p6/600/400'],
    likesCount: 89,
    commentsCount: 32,
    sharesCount: 7,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: '4',
    user: { id: 'u4', username: '设计师小林', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lin', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 },
    content: '新完成的项目设计稿，极简风格永远不过时 ✨',
    images: ['https://picsum.photos/seed/p7/600/400', 'https://picsum.photos/seed/p8/600/400', 'https://picsum.photos/seed/p9/600/400', 'https://picsum.photos/seed/p10/600/400'],
    likesCount: 256,
    commentsCount: 45,
    sharesCount: 28,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: '5',
    user: { id: 'u5', username: '旅行者老王', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 },
    content: '云南大理的洱海，美得让人窒息 💙',
    images: ['https://picsum.photos/seed/p11/600/400'],
    likesCount: 312,
    commentsCount: 56,
    sharesCount: 42,
    isLiked: true,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoadingMore(false);
  }, [isLoadingMore]);

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

      <div className="space-y-4">
        {posts.map((post, idx) => (
          <div key={post.id} ref={idx === posts.length - 1 ? lastPostRef : undefined}>
            <PostCard post={post} onLike={handleLike} onBookmark={handleBookmark} />
          </div>
        ))}

        {isLoadingMore && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>
    </div>
  );
}
