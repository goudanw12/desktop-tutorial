import { useState, useEffect } from 'react';
import { Hash, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { get } from '@/lib/api';
import PostCard from '@/components/PostCard';
import type { Post } from '@/types';

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

export default function Topic() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    if (!tag) return;
    setIsLoading(true);
    const fetchPosts = async () => {
      try {
        const res = await get<{ success: boolean; data: { posts: any[] } }>(`/search?q=${encodeURIComponent(tag)}&type=post`);
        const mapped = (res.data?.posts || []).map(mapApiPost);
        setPosts(mapped);
        setPostCount(mapped.length);
      } catch {}
      setIsLoading(false);
    };
    fetchPosts();
  }, [tag]);

  const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updates } : p)));
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setPostCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Hash className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">#{tag}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{postCount} 条动态</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">该话题下暂无动态</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} onDelete={handleDeletePost} />
          ))}
        </div>
      )}
    </div>
  );
}
