import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment;
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
  return `${Math.floor(hours / 24)}天前`;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likesCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <div className="flex gap-3 py-3 animate-fadeIn">
      <img
        src={comment.user.avatar}
        alt={comment.user.username}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.user.username}</span>
          <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{comment.content}</p>
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1 mt-1 text-xs transition-colors',
            isLiked ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'
          )}
        >
          <Heart className={cn('w-3.5 h-3.5', isLiked && 'fill-current')} />
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>
      </div>
    </div>
  );
}
