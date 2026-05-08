import { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { post as apiPost, del } from '@/lib/api';
import type { UserProfile } from '@/types';

interface UserCardProps {
  user: UserProfile;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

export default function UserCard({ user, onFollowChange }: UserCardProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isSelf = currentUser?.id === user.id;

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isFollowing) {
        await del(`/users/${user.id}/follow`);
        setIsFollowing(false);
        onFollowChange?.(user.id, false);
      } else {
        await apiPost(`/users/${user.id}/follow`);
        setIsFollowing(true);
        onFollowChange?.(user.id, true);
      }
    } catch {}
    setIsLoading(false);
  };

  return (
    <div
      onClick={() => navigate(`/profile/${user.id}`)}
      className="flex items-center gap-3 py-3 cursor-pointer group"
    >
      <img
        src={user.avatar}
        alt={user.username}
        className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200 dark:ring-dark-600 group-hover:ring-primary-300 transition-all"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
          {user.isVerified && (
            <span className="w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center text-[8px]">✓</span>
          )}
        </div>
        {user.bio && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.bio}</p>
        )}
      </div>
      {!isSelf && (
        <button
          onClick={handleFollow}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            isFollowing
              ? 'border border-gray-300 dark:border-dark-500 text-gray-600 dark:text-gray-400 hover:text-red-500 hover:border-red-300'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          )}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-3 h-3" />
              已关注
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3" />
              关注
            </>
          )}
        </button>
      )}
    </div>
  );
}
