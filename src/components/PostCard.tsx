import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export default function PostCard({ post, onLike, onBookmark }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 600);
    onLike?.(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);
  };

  const imageGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-h-80';
    if (count === 2) return 'grid-cols-2 max-h-64';
    if (count === 3) return 'grid-cols-3 max-h-64';
    return 'grid-cols-2 max-h-80';
  };

  return (
    <article className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600 animate-fadeIn">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={post.user.avatar}
          alt={post.user.username}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900/30"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.user.username}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(post.createdAt)}</p>
        </div>
      </div>

      {post.content && (
        <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {post.images.length > 0 && (
        <div className={cn('grid gap-1 rounded-xl overflow-hidden mb-3', imageGridClass(post.images.length))}>
          {post.images.slice(0, 4).map((img, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden">
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {idx === 3 && post.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">+{post.images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-700">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200',
            isLiked
              ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
          )}
        >
          <Heart
            className={cn(
              'w-4.5 h-4.5 transition-all',
              isLiked && 'fill-current',
              heartAnim && 'animate-heartBeat'
            )}
          />
          <span>{likesCount > 0 ? likesCount : '赞'}</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-mint-500 hover:bg-mint-50 dark:hover:bg-mint-900/20 transition-all duration-200">
          <MessageCircle className="w-4.5 h-4.5" />
          <span>{post.commentsCount > 0 ? post.commentsCount : '评论'}</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
          <Share2 className="w-4.5 h-4.5" />
          <span>{post.sharesCount > 0 ? post.sharesCount : '分享'}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200',
            isBookmarked
              ? 'text-warm-600 bg-warm-50 dark:bg-warm-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-warm-600 hover:bg-warm-50 dark:hover:bg-warm-900/20'
          )}
        >
          <Bookmark className={cn('w-4.5 h-4.5', isBookmarked && 'fill-current')} />
        </button>
      </div>
    </article>
  );
}
