import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { get } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface ChatItem {
  id: string;
  type: string;
  name?: string;
  members: { id: string; username: string; avatar: string; is_verified: number; role: string }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
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

  useEffect(() => {
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
    fetchChats();
  }, [currentUser]);

  const filteredChats = chats.filter((chat: any) =>
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
      <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4 md:hidden">消息</h1>

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
        {filteredChats.map((chat: any) => (
          <button
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`, { state: { chat } })}
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
                  {chat.unreadCount}
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
          <div className="p-8 text-center text-gray-400">
            {chats.length === 0 ? '暂无聊天记录' : '没有找到相关聊天'}
          </div>
        )}
      </div>
    </div>
  );
}
