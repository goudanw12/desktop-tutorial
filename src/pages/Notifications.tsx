import { useState, useEffect } from 'react';
import { CheckCheck, Heart, MessageCircle, UserPlus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { get, put } from '@/lib/api';
import type { Notification } from '@/types';

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'like', label: '点赞' },
  { key: 'comment', label: '评论' },
  { key: 'follow', label: '关注' },
];

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

const typeConfig = {
  like: { icon: Heart, color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
  comment: { icon: MessageCircle, color: 'text-mint-500 bg-mint-50 dark:bg-mint-900/20' },
  follow: { icon: UserPlus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  system: { icon: Info, color: 'text-warm-600 bg-warm-50 dark:bg-warm-900/20' },
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await get<{ success: boolean; data: { notifications: any[] } }>('/notifications');
        const mapped = (res.data?.notifications || []).map((n: any) => ({
          id: n.id,
          type: n.type as Notification['type'],
          user: n.from_username ? {
            id: n.from_user_id || '',
            username: n.from_username,
            email: '',
            avatar: n.from_avatar || `https://picsum.photos/seed/${n.from_user_id}/200/200`,
            bio: '',
            coverImage: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
          } : undefined,
          content: n.content || '',
          isRead: !!n.is_read,
          createdAt: n.created_at,
          postId: n.post_id || undefined,
        }));
        setNotifications(mapped);
      } catch {}
      setIsLoading(false);
    };
    fetchNotifications();
  }, []);

  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeTab);

  const handleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await put('/notifications/read', { notificationIds: [id] });
    } catch {}
  };

  const handleReadAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await put('/notifications/read-all');
    } catch {}
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleRead(notification.id);
    }
    if (notification.type === 'follow' && notification.user) {
      navigate(`/profile/${notification.user.id}`);
    } else if ((notification.type === 'like' || notification.type === 'comment') && notification.postId) {
      navigate(`/post/${notification.postId}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">通知</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleReadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            全部已读
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeTab === tab.key
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 divide-y divide-gray-100 dark:divide-dark-700">
          {filteredNotifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.system;
            const Icon = config.icon;
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'flex items-start gap-3 p-4 transition-all duration-200 cursor-pointer',
                  notification.isRead
                    ? 'bg-white dark:bg-dark-800'
                    : 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                )}
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', config.color)}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {notification.user && (
                      <img
                        src={notification.user.avatar}
                        alt={notification.user.username}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {notification.user && (
                        <span className="font-medium">{notification.user.username}</span>
                      )}
                      {' '}{notification.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                </div>

                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}

          {filteredNotifications.length === 0 && (
            <div className="p-8 text-center text-gray-400">暂无通知</div>
          )}
        </div>
      )}
    </div>
  );
}
