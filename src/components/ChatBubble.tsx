import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  avatar: string;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBubble({ message, isOwn, avatar }: ChatBubbleProps) {
  return (
    <div className={cn('flex gap-2 mb-3 animate-bubbleIn', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {!isOwn && (
        <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      )}

      <div className={cn('max-w-[70%] flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {message.type === 'text' ? (
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
              isOwn
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
            )}
          >
            {message.content}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden">
            <img src={message.content} alt="" className="max-w-full rounded-2xl" />
          </div>
        )}

        <div className={cn('flex items-center gap-1 mt-1 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-gray-400">{formatTime(message.createdAt)}</span>
          {isOwn && (
            message.isRead
              ? <CheckCheck className="w-3.5 h-3.5 text-mint-500" />
              : <Check className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}
