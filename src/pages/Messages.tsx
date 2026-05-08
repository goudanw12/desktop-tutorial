import { useState, useEffect } from 'react';
import { Search, MessageSquarePlus, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { get, post as apiPost } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { dispatchRefreshUnread } from '@/lib/events';
import type { UserProfile } from '@/types';

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

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export default function Messages() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState<UserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchChats = async () => {
    try {
      const res = await get<{ success: boolean; data: any[] }>('/chats');
      const mapped = (res.data || []).map((chat: any) => {
        const otherMember = (chat.members || []).find(
          (m: any) => m.id !== currentUser?.id
        );
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
    } catch {
      setChats([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChats();
    const handleFocus = () => fetchChats();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUser]);

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await get<{ success: boolean; data: { users: any[] } }>(`/search?q=${encodeURIComponent(query)}&type=users`);
      setSearchUsers((res.data?.users || []).map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email || '',
        avatar: u.avatar || `https://picsum.photos/seed/${u.id}/200/200`,
        bio: u.bio || '',
        coverImage: '',
        followersCount: u.followerCount || 0,
        followingCount: u.followingCount || 0,
        postsCount: u.postCount || 0,
        isVerified: !!u.is_verified,
      })));
    } catch {
      setSearchUsers([]);
    }
    setSearchLoading(false);
  };

  const handleStartChat = async (userId: string) => {
    try {
      const res = await apiPost<{ success: boolean; data: any }>('/chats', {
        type: 'private',
        memberIds: [userId],
      });
      setShowNewChat(false);
      setSearchUsers([]);
      dispatchRefreshUnread();
      navigate(`/chat/${res.data.id}`, { state: { chat: res.data } });
    } catch {}
  };

  const filteredChats = chats.filter((chat) =>
    (chat.displayName || '').includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
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
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white md:hidden">消息</h1>
        <div className="hidden md:block" />
        <button
          onClick={() => setShowNewChat(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-medium hover:bg-primary-600 transition-all shadow-sm"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span className="hidden md:inline">发起聊天</span>
        </button>
      </div>

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

      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 divide-y divide-gray-100 dark:divide-dark-700">
        {filteredChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => {
              dispatchRefreshUnread();
              navigate(`/chat/${chat.id}`, { state: { chat } });
            }}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <div className="relative">
              <img
                src={chat.displayAvatar}
                alt={chat.displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
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
              <p className={cn(
                'text-sm truncate mt-0.5',
                chat.unreadCount > 0 ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'
              )}>
                {chat.lastMessage || '暂无消息'}
              </p>
            </div>
          </button>
        ))}

        {filteredChats.length === 0 && (
          <div className="p-8 text-center">
            {chats.length === 0 ? (
              <div className="text-gray-400 text-sm">
                <p>暂无聊天记录</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="mt-2 text-primary-500 hover:underline"
                >
                  发起新聊天
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">没有找到相关聊天</p>
            )}
          </div>
        )}
      </div>

      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={() => { setShowNewChat(false); setSearchUsers([]); }}>
          <div
            className="bg-white dark:bg-dark-800 w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[70vh] flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">发起聊天</h3>
              <button onClick={() => { setShowNewChat(false); setSearchUsers([]); }} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-dark-600">
              <input
                type="text"
                placeholder="搜索用户..."
                autoFocus
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-dark-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {searchLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {searchQuery ? '未找到用户' : '搜索用户名开始聊天'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-700">
                  {searchUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartChat(user.id)}
                      className="w-full flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                    >
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
