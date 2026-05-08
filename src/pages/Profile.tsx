import { useState, useEffect } from 'react';
import { Settings, Edit3, Image as ImageIcon, Grid3X3, ArrowLeft, UserPlus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { get, post as apiPost, del } from '@/lib/api';
import PostCard from '@/components/PostCard';
import type { Post, UserProfile } from '@/types';

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'photos'>('posts');
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetUserId = userId || currentUser?.id;

  useEffect(() => {
    if (!targetUserId) return;
    setIsLoading(true);

    const fetchProfile = async () => {
      try {
        const userRes = await get<{ success: boolean; data: any }>(`/users/${targetUserId}`);
        const u = userRes.data;
        setProfileUser({
          id: u.id,
          username: u.username,
          email: u.email || '',
          avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
          bio: u.bio || '',
          coverImage: `https://picsum.photos/seed/cover${u.id}/800/300`,
          followersCount: u.followerCount || 0,
          followingCount: u.followingCount || 0,
          postsCount: u.postCount || 0,
          isVerified: !!u.is_verified,
        });
      } catch {
        if (currentUser && isOwnProfile) {
          setProfileUser(currentUser);
        }
      }

      try {
        const postsRes = await get<{ success: boolean; data: { posts: any[] } }>(`/users/${targetUserId}/posts`);
        const mappedPosts = (postsRes.data?.posts || []).map((p: any) => ({
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
          images: JSON.parse(p.images || '[]'),
          likesCount: p.like_count || 0,
          commentsCount: p.comment_count || 0,
          sharesCount: p.share_count || 0,
          isLiked: !!p.is_liked,
          isBookmarked: !!p.is_bookmarked,
          createdAt: p.created_at,
        }));
        setPosts(mappedPosts);

        const allPhotos: string[] = [];
        mappedPosts.forEach((p: Post) => {
          p.images.forEach((img) => allPhotos.push(img));
        });
        setPhotos(allPhotos);
      } catch {}

      if (!isOwnProfile && currentUser) {
        try {
          const followingRes = await get<{ success: boolean; data: { following: any[] } }>(`/users/${currentUser.id}/following`);
          const isFollowed = (followingRes.data?.following || []).some((f: any) => f.id === targetUserId);
          setIsFollowing(isFollowed);
        } catch {}
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [targetUserId, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!userId || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await del(`/users/${userId}/follow`);
        setIsFollowing(false);
        setProfileUser((prev) => prev ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) } : prev);
      } else {
        await apiPost(`/users/${userId}/follow`);
        setIsFollowing(true);
        setProfileUser((prev) => prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev);
      }
    } catch {}
    setFollowLoading(false);
  };

  const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updates } : p)));
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="animate-shimmer h-56 rounded-2xl mb-4" />
        <div className="animate-shimmer h-16 w-16 rounded-full -mt-8 mb-4" />
        <div className="animate-shimmer h-4 w-32 mb-2" />
        <div className="animate-shimmer h-3 w-48" />
      </div>
    );
  }

  const displayUser = profileUser || currentUser || {
    id: '', username: '用户', email: '', avatar: '', bio: '', coverImage: '',
    followersCount: 0, followingCount: 0, postsCount: 0,
  };

  return (
    <div>
      <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg sticky top-14 z-20 border-b border-gray-100 dark:border-dark-700">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="font-display text-lg font-bold text-gray-900 dark:text-white">{displayUser.username}</h1>
      </div>

      <div className="relative">
        <div className="h-40 md:h-56 bg-gradient-to-r from-primary-400 via-primary-500 to-warm-400 relative overflow-hidden">
          {displayUser.coverImage && (
            <img
              src={displayUser.coverImage}
              alt=""
              className="w-full h-full object-cover mix-blend-overlay"
            />
          )}
        </div>

        {isOwnProfile && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="px-4 md:px-6 -mt-16 relative z-10">
          <div className="flex items-end gap-4">
            <img
              src={displayUser.avatar}
              alt={displayUser.username}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-dark-800 shadow-lg"
            />
            <div className="pb-2 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">{displayUser.username}</h1>
                {displayUser.isVerified && (
                  <span className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px]">✓</span>
                )}
              </div>
              <div className="mt-2">
                {isOwnProfile ? (
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 dark:border-dark-500 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    编辑资料
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                      isFollowing
                        ? 'border border-gray-300 dark:border-dark-500 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    )}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        已关注
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        关注
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {displayUser.bio && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{displayUser.bio}</p>
          )}

          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">{displayUser.postsCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">动态</p>
            </div>
            <div className="text-center cursor-pointer" onClick={() => {}}>
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">{displayUser.followingCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">关注</p>
            </div>
            <div className="text-center cursor-pointer" onClick={() => {}}>
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">{displayUser.followersCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">粉丝</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 mt-4">
        <div className="flex border-b border-gray-200 dark:border-dark-600">
          <button
            onClick={() => setActiveTab('posts')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all',
              activeTab === 'posts'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Grid3X3 className="w-4 h-4" />
            动态
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all',
              activeTab === 'photos'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <ImageIcon className="w-4 h-4" />
            相册
          </button>
        </div>

        <div className="mt-4 pb-4">
          {activeTab === 'posts' ? (
            posts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                {isOwnProfile ? '还没有发布动态，来分享你的第一条吧～' : '该用户还没有发布动态'}
              </div>
            ) : (
              <div className="space-y-4 max-w-2xl">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} onUpdate={handlePostUpdate} />
                ))}
              </div>
            )
          ) : photos.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">暂无照片</div>
          ) : (
            <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
              {photos.map((photo, idx) => (
                <div key={idx} className="aspect-square overflow-hidden group cursor-pointer">
                  <img
                    src={photo}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
