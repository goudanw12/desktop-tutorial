import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { get } from '@/lib/api';
import StoryViewer from './StoryViewer';
import type { StoryGroup } from '@/types';

export default function StoryBar() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [viewerGroupIndex, setViewerGroupIndex] = useState(-1);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await get<{ success: boolean; data: StoryGroup[] }>('/stories');
        setStoryGroups(res.data || []);
      } catch {}
    };
    fetchStories();
  }, []);

  const openStory = (index: number) => {
    setViewerGroupIndex(index);
  };

  const closeStory = () => {
    setViewerGroupIndex(-1);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1">
        <button
          onClick={() => navigate('/publish')}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-700 border-2 border-dashed border-gray-300 dark:border-dark-500 flex items-center justify-center">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">我的故事</span>
        </button>

        {storyGroups.map((group, index) => {
          const hasUnviewed = group.stories.some((s) => !(s as any).is_viewed);
          return (
            <button
              key={group.user.id}
              onClick={() => openStory(index)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className={cn(
                'w-16 h-16 rounded-full p-0.5',
                hasUnviewed
                  ? 'bg-gradient-to-tr from-primary-500 via-warm-400 to-primary-600'
                  : 'bg-gray-300 dark:bg-dark-500'
              )}>
                <img
                  src={group.user.avatar}
                  alt={group.user.username}
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-dark-800"
                />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[64px] truncate">
                {group.user.username}
              </span>
            </button>
          );
        })}
      </div>

      {viewerGroupIndex >= 0 && storyGroups.length > 0 && (
        <StoryViewer
          groups={storyGroups}
          initialGroupIndex={viewerGroupIndex}
          onClose={closeStory}
        />
      )}
    </>
  );
}
