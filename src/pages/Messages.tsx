import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ChatItem {
  id: string;
  username: string;
  avatar: string;
  lastMessage: string;
  unreadCount: number;
  lastMessageTime: string;
}

const MOCK_CHATS: ChatItem[] = [
  { id: 'c1', username: '小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hong', lastMessage: '明天一起去爬山吧！', unreadCount: 2, lastMessageTime: new Date(Date.now() - 300000).toISOString() },
  { id: 'c2', username: '阿杰', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jie', lastMessage: '照片已经修好了，发给你看看', unreadCount: 0, lastMessageTime: new Date(Date.now() - 3600000).toISOString() },
  { id: 'c3', username: '美美', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mei', lastMessage: '那家餐厅真的很好吃！', unreadCount: 1, lastMessageTime: new Date(Date.now() - 7200000).toISOString() },
  { id: 'c4', username: '大伟', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wei', lastMessage: '周末有空吗？一起打球', unreadCount: 0, lastMessageTime: new Date(Date.now() - 86400000).toISOString() },
  { id: 'c5', username: '小芳', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fang', lastMessage: '收到啦，谢谢！', unreadCount: 0, lastMessageTime: new Date(Date.now() - 172800000).toISOString() },
];

function formatTime(dateStr: string) {
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = MOCK_CHATS.filter((chat) =>
    chat.username.includes(searchQuery)
  );

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
        {filteredChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.username}
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
                <p className="text-sm font-medium text-gray-900 dark:text-white">{chat.username}</p>
                <span className="text-xs text-gray-400">{formatTime(chat.lastMessageTime)}</span>
              </div>
              <p className={cn(
                'text-sm truncate mt-0.5',
                chat.unreadCount > 0 ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'
              )}>
                {chat.lastMessage}
              </p>
            </div>
          </button>
        ))}

        {filteredChats.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            没有找到相关聊天
          </div>
        )}
      </div>
    </div>
  );
}
