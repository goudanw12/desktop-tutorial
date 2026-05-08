import { useState } from 'react';
import { Settings, Edit3, Image as ImageIcon, Grid3X3, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import PostCard from '@/components/PostCard';
import type { Post } from '@/types';

const MOCK_USER_POSTS: Post[] = [
  {
    id: 'up1',
    user: { id: '1', username: '小明', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 },
    content: '周末在家做了一顿大餐 🍳',
    images: ['https://picsum.photos/seed/up1/600/400'],
    likesCount: 32,
    commentsCount: 5,
    sharesCount: 1,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'up2',
    user: { id: '1', username: '小明', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 },
    content: '新买的书到了，周末有事情做了 📚',
    images: ['https://picsum.photos/seed/up2/600/400', 'https://picsum.photos/seed/up3/600/400'],
    likesCount: 56,
    commentsCount: 12,
    sharesCount: 3,
    isLiked: true,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const MOCK_PHOTOS = [
  'https://picsum.photos/seed/ph1/300/300',
  'https://picsum.photos/seed/ph2/300/300',
  'https://picsum.photos/seed/ph3/300/300',
  'https://picsum.photos/seed/ph4/300/300',
  'https://picsum.photos/seed/ph5/300/300',
  'https://picsum.photos/seed/ph6/300/300',
  'https://picsum.photos/seed/ph7/300/300',
  'https://picsum.photos/seed/ph8/300/300',
  'https://picsum.photos/seed/ph9/300/300',
];

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'photos'>('posts');

  const profileUser = user || {
    id: '1',
    username: '小明',
    email: 'xiaoming@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
    bio: '热爱生活，分享美好 ✨',
    coverImage: 'https://picsum.photos/seed/cover1/800/300',
    followersCount: 128,
    followingCount: 256,
    postsCount: 42,
  };

  return (
    <div>
      <div className="relative">
        <div className="h-40 md:h-56 bg-gradient-to-r from-primary-400 via-primary-500 to-warm-400 relative overflow-hidden">
          <img
            src={profileUser.coverImage}
            alt=""
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 md:px-6 -mt-16 relative z-10">
          <div className="flex items-end gap-4">
            <img
              src={profileUser.avatar}
              alt={profileUser.username}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-dark-800 shadow-lg"
            />
            <div className="pb-2 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">{profileUser.username}</h1>
                <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 dark:border-dark-500 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all">
                  <Edit3 className="w-3.5 h-3.5" />
                  编辑资料
                </button>
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{profileUser.bio}</p>

          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">{profileUser.postsCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">动态</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">{profileUser.followingCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">关注</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">{profileUser.followersCount}</p>
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

        <div className="mt-4">
          {activeTab === 'posts' ? (
            <div className="space-y-4 max-w-2xl">
              {MOCK_USER_POSTS.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
              {MOCK_PHOTOS.map((photo, idx) => (
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
