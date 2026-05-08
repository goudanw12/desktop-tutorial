import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, Video, Image, Smile, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { get, post as apiPost } from '@/lib/api';
import { dispatchRefreshUnread } from '@/lib/events';
import ChatBubble from '@/components/ChatBubble';
import type { Message } from '@/types';

export default function ChatDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user: currentUser } = useAuthStore();
  const locationState = location.state as { chat?: any } | null;

  const [chatName, setChatName] = useState('');
  const [chatAvatar, setChatAvatar] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (locationState?.chat) {
      const chat = locationState.chat;
      const otherMember = (chat.members || []).find(
        (m: any) => m.id !== currentUser?.id
      );
      setChatName(chat.type === 'group' ? (chat.name || '群聊') : (otherMember?.username || '用户'));
      setChatAvatar(chat.type === 'group' ? (chat.avatar || '') : (otherMember?.avatar || ''));
    }

    const fetchMessages = async () => {
      if (!id) return;
      try {
        const res = await get<{ success: boolean; data: { messages: any[] } }>(`/chats/${id}/messages`);
        const mapped = (res.data?.messages || []).map((m: any) => ({
          id: m.id,
          chatId: m.chat_id,
          senderId: m.sender_id,
          sender: {
            id: m.sender_id,
            username: m.username,
            email: '',
            avatar: m.avatar || '',
            bio: '',
            coverImage: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            isVerified: !!m.is_verified,
          },
          content: m.content,
          type: m.type || 'text',
          isRead: !!m.is_read,
          createdAt: m.created_at,
        }));
        setMessages(mapped);
      } catch {}
      setIsLoading(false);
    };
    fetchMessages();

    const markAsRead = async () => {
      if (!id) return;
      try {
        await apiPost(`/chats/${id}/read`, {});
        dispatchRefreshUnread();
      } catch {}
    };
    markAsRead();
  }, [id, currentUser, locationState]);

  const handleSend = async () => {
    if (!inputValue.trim() || !id) return;
    const text = inputValue.trim();
    setInputValue('');

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      chatId: id,
      senderId: currentUser?.id || 'me',
      sender: currentUser || { id: 'me', username: '我', email: '', avatar: '', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 },
      content: text,
      type: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      await apiPost(`/chats/${id}/messages`, { content: text, type: 'text' });
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-600">
        <button onClick={() => navigate(-1)} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img src={chatAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{chatName || '聊天'}</p>
          <p className="text-xs text-mint-500">在线</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-primary-500 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-primary-500 transition-colors">
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">暂无消息，发送第一条吧～</div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUser?.id}
              avatar={chatAvatar}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600">
        <div className="flex items-end gap-2">
          <button className="p-2.5 text-gray-500 hover:text-primary-500 transition-colors flex-shrink-0">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-gray-500 hover:text-warm-600 transition-colors flex-shrink-0">
            <Smile className="w-5 h-5" />
          </button>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 resize-none bg-gray-100 dark:bg-dark-700 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              'p-2.5 rounded-xl transition-all duration-200 flex-shrink-0',
              inputValue.trim()
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-100 dark:bg-dark-700 text-gray-400'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
