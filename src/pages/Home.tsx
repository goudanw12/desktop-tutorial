import { useState, useCallback, useRef, useEffect } from 'react';
import { RefreshCw, ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import StoryBar from '@/components/StoryBar';
import PostCard from '@/components/PostCard';
import { get } from '@/lib/api';
import { useThemeStore } from '@/stores/themeStore';
import type { Post } from '@/types';

const PRESET_BGS = [
  '',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=soft%20gradient%20pastel%20abstract%20background%20smooth%20blurred&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=night%20sky%20stars%20milky%20way%20dark%20blue%20cosmic&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20sunset%20golden%20horizon%20calm%20water&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cherry%20blossom%20spring%20pink%20flowers%20dreamy&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20forest%20green%20nature%20misty&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aurora%20borealis%20northern%20lights%20green%20purple%20sky&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rain%20drops%20window%20cozy%20moody%20dark&image_size=landscape_16_9',
];

function SkeletonCard() {
  return (
    <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600">
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
      avatar: p.avatar || `https://picsum.photos/seed/${p.user_id}/200/200`,
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
    isOwner: !!p.is_owner,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags || []),
    location: p.location || null,
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
  const [showBgPicker, setShowBgPicker] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const homeBg = useThemeStore((s) => s.homeBg);
  const setHomeBg = useThemeStore((s) => s.setHomeBg);

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

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleCustomBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setHomeBg(dataUrl);
      setShowBgPicker(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="relative min-h-screen"
      style={homeBg ? {
        backgroundImage: `url(${homeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : undefined}
    >
      {homeBg && <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />}

      <div className="relative z-10 p-4 md:p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:hidden">
          <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">动态</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBgPicker(true)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <button
              onClick={handleRefresh}
              className={cn('p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all', isRefreshing && 'animate-spin')}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-end mb-4 gap-2">
          <button
            onClick={() => setShowBgPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
          >
            <ImagePlus className="w-4 h-4" />
            更换背景
          </button>
          <button
            onClick={handleRefresh}
            className={cn('p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all', isRefreshing && 'animate-spin')}
          >
            <RefreshCw className="w-4 h-4" />
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
                <PostCard post={post} onLike={handleLike} onBookmark={handleBookmark} onUpdate={handlePostUpdate} onDelete={handleDeletePost} />
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

      {showBgPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBgPicker(false)}>
          <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">更换主页背景</h3>
              <button onClick={() => setShowBgPicker(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRESET_BGS.map((bg, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setHomeBg(bg); setShowBgPicker(false); }}
                    className={cn(
                      'aspect-video rounded-xl overflow-hidden border-2 transition-all',
                      homeBg === bg ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                    )}
                  >
                    {bg ? (
                      <img src={bg} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-xs text-gray-400">
                        默认
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 text-sm font-medium cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all">
                  <ImagePlus className="w-4 h-4" />
                  上传自定义背景
                  <input type="file" accept="image/*" onChange={handleCustomBg} className="hidden" />
                </label>
                {homeBg && (
                  <button
                    onClick={() => { setHomeBg(''); setShowBgPicker(false); }}
                    className="px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    清除背景
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
