import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Story as StoryType } from '@/types';

const MOCK_STORIES: StoryType[] = [
  { id: '1', user: { id: 'u1', username: '小红', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hong', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, image: 'https://picsum.photos/seed/s1/400/700', createdAt: new Date().toISOString(), isViewed: false },
  { id: '2', user: { id: 'u2', username: '阿杰', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jie', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, image: 'https://picsum.photos/seed/s2/400/700', createdAt: new Date().toISOString(), isViewed: false },
  { id: '3', user: { id: 'u3', username: '美美', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mei', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, image: 'https://picsum.photos/seed/s3/400/700', createdAt: new Date().toISOString(), isViewed: true },
  { id: '4', user: { id: 'u4', username: '大伟', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wei', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, image: 'https://picsum.photos/seed/s4/400/700', createdAt: new Date().toISOString(), isViewed: true },
  { id: '5', user: { id: 'u5', username: '小芳', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fang', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, image: 'https://picsum.photos/seed/s5/400/700', createdAt: new Date().toISOString(), isViewed: false },
  { id: '6', user: { id: 'u6', username: '老王', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 }, image: 'https://picsum.photos/seed/s6/400/700', createdAt: new Date().toISOString(), isViewed: true },
];

export default function StoryBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewingStory, setViewingStory] = useState<StoryType | null>(null);

  return (
    <>
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600 mb-4">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          <button className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-500">
              <Plus className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">添加故事</span>
          </button>

          {MOCK_STORIES.map((story) => (
            <button
              key={story.id}
              onClick={() => setViewingStory(story)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-full p-0.5',
                  story.isViewed
                    ? 'bg-gray-300 dark:bg-dark-500'
                    : 'bg-gradient-to-tr from-primary-500 via-warm-500 to-mint-500'
                )}
              >
                <img
                  src={story.user.avatar}
                  alt={story.user.username}
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-dark-800"
                />
              </div>
              <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-16">
                {story.user.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {viewingStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-fadeIn" onClick={() => setViewingStory(null)}>
          <button
            onClick={() => setViewingStory(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-sm h-[80vh] relative rounded-2xl overflow-hidden">
            <img src={viewingStory.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center gap-2">
                <img src={viewingStory.user.avatar} alt="" className="w-8 h-8 rounded-full" />
                <span className="text-white text-sm font-medium">{viewingStory.user.username}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
