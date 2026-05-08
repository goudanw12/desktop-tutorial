import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationItem from '@/components/NotificationItem';
import type { Notification } from '@/types';

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'like', user: { id: 'u1', username: '小红', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hong', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, content: '小红 赞了你的动态', isRead: false, createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'n2', type: 'comment', user: { id: 'u2', username: '阿杰', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jie', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, content: '阿杰 评论了你的动态：太棒了！', isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'n3', type: 'follow', user: { id: 'u3', username: '美美', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mei', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, content: '美美 关注了你', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n4', type: 'like', user: { id: 'u4', username: '大伟', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wei', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, content: '大伟 赞了你的评论', isRead: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'n5', type: 'system', content: '你的账号已通过实名认证', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n6', type: 'comment', user: { id: 'u5', username: '小芳', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fang', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, content: '小芳 回复了你的评论：同意！', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'n7', type: 'follow', user: { id: 'u6', username: '老王', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, content: '老王 关注了你', isRead: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'like', label: '点赞' },
  { key: 'comment', label: '评论' },
  { key: 'follow', label: '关注' },
  { key: 'system', label: '系统' },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeTab);

  const handleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleReadAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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

      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 divide-y divide-gray-100 dark:divide-dark-700">
        {filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={handleRead}
          />
        ))}

        {filteredNotifications.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            暂无通知
          </div>
        )}
      </div>
    </div>
  );
}
