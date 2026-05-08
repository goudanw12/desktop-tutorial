import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { post as apiPost, del } from '@/lib/api';
import type { UserProfile } from '@/types';

interface UserCardProps {
  user: UserProfile;
  initialFollowing?: boolean;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

export default function UserCard({ user, initialFollowing = false, onFollowChange }: UserCardProps) {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);

    const prevFollowing = isFollowing;
    setIsFollowing(!prevFollowing);
    onFollowChange?.(user.id, !prevFollowing);

    try {
      if (prevFollowing) {
        await del(`/users/${user.id}/follow`);
      } else {
        await apiPost(`/users/${user.id}/follow`);
      }
    } catch {
      setIsFollowing(prevFollowing);
      onFollowChange?.(user.id, prevFollowing);
    }
    setIsLoading(false);
  };

  return (
    <div
      className="flex items-center gap-3 py-3 cursor-pointer"
      onClick={() => navigate(`/profile/${user.id}`)}
    >
      <img
        src={user.avatar}
        alt={user.username}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.bio}</p>
      </div>
      <button
        onClick={handleFollow}
        disabled={isLoading}
        className={cn(
          'px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
          isFollowing
            ? 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
            : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm hover:shadow-md hover:shadow-primary-200 dark:hover:shadow-primary-900/30'
        )}
      >
        {isFollowing ? '已关注' : '关注'}
      </button>
    </div>
  );
}
