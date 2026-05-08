import { Heart, MessageCircle, UserPlus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

const typeConfig = {
  like: { icon: Heart, color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
  comment: { icon: MessageCircle, color: 'text-mint-500 bg-mint-50 dark:bg-mint-900/20' },
  follow: { icon: UserPlus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  system: { icon: Info, color: 'text-warm-600 bg-warm-50 dark:bg-warm-900/20' },
};

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

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      onClick={() => !notification.isRead && onRead?.(notification.id)}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer',
        notification.isRead
          ? 'bg-white dark:bg-dark-800'
          : 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20'
      )}
    >
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', config.color)}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        {notification.user && (
          <img
            src={notification.user.avatar}
            alt={notification.user.username}
            className="w-6 h-6 rounded-full object-cover inline-block mr-1 -mt-0.5"
          />
        )}
        <p className="text-sm text-gray-800 dark:text-gray-200 inline">
          {notification.content}
        </p>
        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
      </div>

      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
