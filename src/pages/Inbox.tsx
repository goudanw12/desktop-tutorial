import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MessageSquarePlus, X, User, Trash2, EyeOff, CheckCheck, Heart, MessageCircle, UserPlus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { get, post as apiPost, del, put } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { dispatchRefreshUnread } from '@/lib/events';
import type { UserProfile, Notification } from '@/types';

interface ChatItem {
  id: string;
  type: string;
  name?: string;
  members: { id: string; username: string; avatar: string; is_verified: number; role: string }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  displayName: string;
  displayAvatar: string;
}

const NOTIFICATION_TABS = [
  { key: 'all', label: '全部' },
  { key: 'like', label: '点赞' },
  { key: 'comment', label: '评论' },
  { key: 'follow', label: '关注' },
];

const typeConfig: Record<string, { icon: any; color: string }> = {
  like: { icon: Heart, color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
  comment: { icon: MessageCircle, color: 'text-mint-500 bg-mint-50 dark:bg-mint-900/20' },
  follow: { icon: UserPlus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  system: { icon: Info, color: 'text-warm-600 bg-warm-50 dark:bg-warm-900/20' },
};

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export default function Inbox() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState<UserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const startChatHandledRef = useRef(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifTab, setNotifTab] = useState('all');
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const res = await get<{ success: boolean; data: any[] }>('/chats');
      const mapped = (res.data || []).map((chat: any) => {
        const otherMember = (chat.members || []).find((m: any) => m.id !== currentUserId);
        return {
          id: chat.id,
          type: chat.type,
          name: chat.name,
          members: chat.members || [],
          lastMessage: chat.last_message || '',
          lastMessageAt: chat.last_message_at || chat.updated_at || '',
          unreadCount: chat.unread_count || 0,
          displayName: chat.type === 'group' ? (chat.name || '群聊') : (otherMember?.username || '用户'),
          displayAvatar: chat.type === 'group' ? (chat.avatar || '') : (otherMember?.avatar || ''),
        };
      });
      setChats(mapped);
    } catch { setChats([]); }
    setIsLoadingChats(false);
  }, [currentUserId]);

  const fetchNotifications = useCallback(async () => {
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
    setIsLoadingNotifs(false);
  }, []);

  useEffect(() => {
    fetchChats();
    fetchNotifications();
    const handleFocus = () => { fetchChats(); fetchNotifications(); };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchChats, fetchNotifications]);

  useEffect(() => {
    const state = location.state as { startChatWith?: string } | null;
    if (state?.startChatWith && !startChatHandledRef.current) {
      startChatHandledRef.current = true;
      setActiveTab('messages');
      const userId = state.startChatWith;
      apiPost<{ success: boolean; data: any }>('/chats', {
        type: 'private',
        memberIds: [userId],
      }).then((res) => {
        setShowNewChat(false);
        setSearchUsers([]);
        dispatchRefreshUnread();
        navigate(`/chat/${res.data.id}`, { state: { chat: res.data }, replace: true });
      }).catch(() => {});
    }
  }, [location.state, navigate]);

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) { setSearchUsers([]); return; }
    setSearchLoading(true);
    try {
      const res = await get<{ success: boolean; data: { users: any[] } }>(`/search?q=${encodeURIComponent(query)}&type=users`);
      setSearchUsers((res.data?.users || []).map((u: any) => ({
        id: u.id, username: u.username, email: u.email || '',
        avatar: u.avatar || `https://picsum.photos/seed/${u.id}/200/200`,
        bio: u.bio || '', coverImage: '', followersCount: u.followerCount || 0,
        followingCount: u.followingCount || 0, postsCount: u.postCount || 0, isVerified: !!u.is_verified,
      })));
    } catch { setSearchUsers([]); }
    setSearchLoading(false);
  };

  const handleStartChat = async (userId: string) => {
    try {
      const res = await apiPost<{ success: boolean; data: any }>('/chats', { type: 'private', memberIds: [userId] });
      setShowNewChat(false); setSearchUsers([]);
      dispatchRefreshUnread();
      navigate(`/chat/${res.data.id}`, { state: { chat: res.data } });
    } catch {}
  };

  const handleHideChat = async (chatId: string) => {
    try { await apiPost(`/chats/${chatId}/hide`, {}); } catch {}
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMenuChatId(null); dispatchRefreshUnread();
  };

  const handleDeleteChat = async (chatId: string) => {
    if (deletingChatId) return;
    setDeletingChatId(chatId);
    try { await del(`/chats/${chatId}`); } catch {}
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMenuChatId(null); setDeletingChatId(null); dispatchRefreshUnread();
  };

  const handleReadNotif = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try { await put('/notifications/read', { notificationIds: [id] }); } catch {}
  };

  const handleReadAllNotifs = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try { await put('/notifications/read-all'); } catch {}
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) handleReadNotif(notification.id);
    if (notification.type === 'follow' && notification.user) {
      navigate(`/profile/${notification.user.id}`);
    } else if ((notification.type === 'like' || notification.type === 'comment') && notification.postId) {
      navigate(`/post/${notification.postId}`);
    }
  };

  const filteredChats = chats.filter((chat) => (chat.displayName || '').includes(searchQuery));
  const filteredNotifications = notifTab === 'all' ? notifications : notifications.filter((n) => n.type === notifTab);
  const chatUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);
  const notifUnread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white md:hidden">消息中心</h1>
        <div className="hidden md:block" />
        <div className="flex items-center gap-2">
          {activeTab === 'messages' && (
            <button
              onClick={() => setShowNewChat(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-medium hover:bg-primary-600 transition-all shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="hidden md:inline">发起聊天</span>
            </button>
          )}
          {activeTab === 'notifications' && notifUnread > 0 && (
            <button
              onClick={handleReadAllNotifs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              全部已读
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-700 rounded-xl mb-4">
        <button
          onClick={() => setActiveTab('messages')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all relative',
            activeTab === 'messages'
              ? 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <MessageCircle className="w-4 h-4" />
          消息
          {chatUnread > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-primary-500 text-white rounded-full leading-none">
              {chatUnread > 99 ? '99+' : chatUnread}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all relative',
            activeTab === 'notifications'
              ? 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <Heart className="w-4 h-4" />
          通知
          {notifUnread > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none">
              {notifUnread > 99 ? '99+' : notifUnread}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'messages' && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索聊天..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-dark-700 border-0 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>

          {isLoadingChats ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="w-12 h-12 rounded-full animate-shimmer" />
                  <div className="flex-1">
                    <div className="w-24 h-4 rounded animate-shimmer mb-2" />
                    <div className="w-40 h-3 rounded animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {menuChatId && <div className="fixed inset-0 z-40" onClick={() => setMenuChatId(null)} />}
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 divide-y divide-gray-100 dark:divide-dark-700">
                {filteredChats.map((chat) => (
                  <div key={chat.id} className="relative">
                    <button
                      onClick={() => { dispatchRefreshUnread(); navigate(`/chat/${chat.id}`, { state: { chat } }); }}
                      onContextMenu={(e) => { e.preventDefault(); setMenuChatId(chat.id); }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                    >
                      <div className="relative">
                        <img src={chat.displayAvatar} alt={chat.displayName} className="w-12 h-12 rounded-full object-cover" />
                        {chat.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{chat.displayName}</p>
                          <span className="text-xs text-gray-400">{formatTime(chat.lastMessageAt)}</span>
                        </div>
                        <p className={cn('text-sm truncate mt-0.5', chat.unreadCount > 0 ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400')}>
                          {chat.lastMessage || '暂无消息'}
                        </p>
                      </div>
                    </button>
                    {menuChatId === chat.id && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-dark-700 rounded-xl shadow-lg border border-gray-200 dark:border-dark-600 py-1 min-w-[140px] animate-slideUp">
                        <button onClick={() => handleHideChat(chat.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600">
                          <EyeOff className="w-4 h-4" />隐藏聊天
                        </button>
                        <button onClick={() => handleDeleteChat(chat.id)} disabled={deletingChatId === chat.id} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />{deletingChatId === chat.id ? '删除中...' : '删除聊天'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {filteredChats.length === 0 && (
                  <div className="p-8 text-center">
                    {chats.length === 0 ? (
                      <div className="text-gray-400 text-sm">
                        <p>暂无聊天记录</p>
                        <button onClick={() => setShowNewChat(true)} className="mt-2 text-primary-500 hover:underline">发起新聊天</button>
                      </div>
                    ) : <p className="text-gray-400 text-sm">没有找到相关聊天</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'notifications' && (
        <>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
            {NOTIFICATION_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setNotifTab(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                  notifTab === tab.key
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoadingNotifs ? (
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
                          <img src={notification.user.avatar} alt={notification.user.username} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                        )}
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {notification.user && <span className="font-medium">{notification.user.username}</span>}
                          {' '}{notification.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                    </div>
                    {!notification.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />}
                  </div>
                );
              })}
              {filteredNotifications.length === 0 && <div className="p-8 text-center text-gray-400">暂无通知</div>}
            </div>
          )}
        </>
      )}

      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={() => { setShowNewChat(false); setSearchUsers([]); }}>
          <div className="bg-white dark:bg-dark-800 w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[70vh] flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">发起聊天</h3>
              <button onClick={() => { setShowNewChat(false); setSearchUsers([]); }} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-200 dark:border-dark-600">
              <input type="text" placeholder="搜索用户..." autoFocus onChange={(e) => handleSearchUsers(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-dark-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {searchLoading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : searchUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">{searchQuery ? '未找到用户' : '搜索用户名开始聊天'}</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-700">
                  {searchUsers.map((user) => (
                    <button key={user.id} onClick={() => handleStartChat(user.id)} className="w-full flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                      <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                        {user.bio && <p className="text-xs text-gray-500 truncate">{user.bio}</p>}
                      </div>
                      <User className="w-5 h-5 text-gray-400" />
                    </button>
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
