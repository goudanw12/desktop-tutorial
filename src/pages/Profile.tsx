import { useState, useEffect, useRef } from 'react';
import { Settings, Edit3, Image as ImageIcon, Grid3X3, ArrowLeft, UserPlus, UserCheck, X, Save, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { get, post as apiPost, del, put } from '@/lib/api';
import PostCard from '@/components/PostCard';
import UserCard from '@/components/UserCard';
import type { Post, UserProfile } from '@/types';

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, fetchMe } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'photos'>('posts');
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          avatar: u.avatar || `https://picsum.photos/seed/${u.id}/200/200`,
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

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleOpenEdit = () => {
    if (profileUser) {
      setEditForm({
        username: profileUser.username,
        bio: profileUser.bio,
        phone: '',
      });
      setAvatarPreview(null);
      setAvatarFile(null);
    }
    setShowEditModal(true);
  };

  const handleAvatarSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (editForm.username) formData.append('username', editForm.username);
      if (editForm.bio) formData.append('bio', editForm.bio);
      if (editForm.phone) formData.append('phone', editForm.phone);
      if (avatarFile) formData.append('avatar', avatarFile);

      await put('/users/profile', formData);
      await fetchMe();
      setProfileUser((prev) => prev ? { ...prev, username: editForm.username, bio: editForm.bio, avatar: avatarPreview || prev.avatar } : prev);
      setShowEditModal(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch {}
    setIsSaving(false);
  };

  const fetchFollowers = async () => {
    if (!targetUserId) return;
    try {
      const res = await get<{ success: boolean; data: { followers: any[] } }>(`/users/${targetUserId}/followers`);
      setFollowers((res.data?.followers || []).map((u: any) => ({
        id: u.id,
        username: u.username,
        email: '',
        avatar: u.avatar || `https://picsum.photos/seed/${u.id}/200/200`,
        bio: u.bio || '',
        coverImage: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isVerified: !!u.is_verified,
      })));
    } catch {}
  };

  const fetchFollowing = async () => {
    if (!targetUserId) return;
    try {
      const res = await get<{ success: boolean; data: { following: any[] } }>(`/users/${targetUserId}/following`);
      setFollowing((res.data?.following || []).map((u: any) => ({
        id: u.id,
        username: u.username,
        email: '',
        avatar: u.avatar || `https://picsum.photos/seed/${u.id}/200/200`,
        bio: u.bio || '',
        coverImage: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isVerified: !!u.is_verified,
      })));
    } catch {}
  };

  const handleOpenFollowers = () => {
    setShowFollowersModal(true);
    fetchFollowers();
  };

  const handleOpenFollowing = () => {
    setShowFollowingModal(true);
    fetchFollowing();
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
            <div className="relative">
              <img
                src={displayUser.avatar}
                alt={displayUser.username}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-dark-800 shadow-lg"
              />
            </div>
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
                    onClick={handleOpenEdit}
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
            <button onClick={handleOpenFollowing} className="text-center">
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">{displayUser.followingCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">关注</p>
            </button>
            <button onClick={handleOpenFollowers} className="text-center">
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">{displayUser.followersCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">粉丝</p>
            </button>
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
                  <PostCard key={p.id} post={p} onUpdate={handlePostUpdate} onDelete={handleDeletePost} />
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

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div
            className="bg-white dark:bg-dark-800 w-full max-w-md rounded-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">编辑资料</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <img
                    src={avatarPreview || profileUser?.avatar || ''}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-dark-600"
                  />
                  <button
                    onClick={handleAvatarSelect}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
                <input
                  value={editForm.username}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">简介</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">手机号</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="选填"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-dark-600 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-6 py-2 rounded-full text-sm bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={() => setShowFollowersModal(false)}>
          <div
            className="bg-white dark:bg-dark-800 w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[70vh] flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">粉丝 ({displayUser.followersCount})</h3>
              <button onClick={() => setShowFollowersModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {followers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">暂无粉丝</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-700">
                  {followers.map((u) => (
                    <UserCard key={u.id} user={u} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={() => setShowFollowingModal(false)}>
          <div
            className="bg-white dark:bg-dark-800 w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[70vh] flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">关注 ({displayUser.followingCount})</h3>
              <button onClick={() => setShowFollowingModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {following.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">暂无关注</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-700">
                  {following.map((u) => (
                    <UserCard key={u.id} user={u} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
