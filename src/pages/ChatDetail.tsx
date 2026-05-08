import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Video, Image, Smile, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatBubble from '@/components/ChatBubble';
import type { Message } from '@/types';

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u1', receiverId: 'me', content: '嗨！最近怎么样？', type: 'text', isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm2', senderId: 'me', receiverId: 'u1', content: '还不错！最近在忙一个新项目', type: 'text', isRead: true, createdAt: new Date(Date.now() - 3500000).toISOString() },
  { id: 'm3', senderId: 'u1', receiverId: 'me', content: '听起来很棒！是什么项目？', type: 'text', isRead: true, createdAt: new Date(Date.now() - 3400000).toISOString() },
  { id: 'm4', senderId: 'me', receiverId: 'u1', content: '一个社交应用，用 React + TypeScript 做的', type: 'text', isRead: true, createdAt: new Date(Date.now() - 3300000).toISOString() },
  { id: 'm5', senderId: 'u1', receiverId: 'me', content: '太酷了！能给我看看截图吗？', type: 'text', isRead: true, createdAt: new Date(Date.now() - 3200000).toISOString() },
  { id: 'm6', senderId: 'me', receiverId: 'u1', content: 'https://picsum.photos/seed/chat1/400/300', type: 'image', isRead: true, createdAt: new Date(Date.now() - 3100000).toISOString() },
  { id: 'm7', senderId: 'u1', receiverId: 'me', content: '设计很漂亮！明天一起去爬山吧！', type: 'text', isRead: false, createdAt: new Date(Date.now() - 300000).toISOString() },
];

const CHAT_USER = {
  id: 'u1',
  username: '小红',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hong',
};

export default function ChatDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: 'me',
      receiverId: id || 'u1',
      content: inputValue,
      type: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
        <img src={CHAT_USER.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{CHAT_USER.username}</p>
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

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === 'me'}
            avatar={CHAT_USER.avatar}
          />
        ))}
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
