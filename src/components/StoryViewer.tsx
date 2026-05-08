import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoryGroup } from '@/types';

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export default function StoryViewer({ groups, initialGroupIndex, onClose }: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const DURATION = 5000;

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goToNext = useCallback(() => {
    if (!currentGroup) return;
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
      elapsedRef.current = 0;
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((prev) => prev + 1);
      setStoryIndex(0);
      setProgress(0);
      elapsedRef.current = 0;
    } else {
      onClose();
    }
  }, [currentGroup, storyIndex, groupIndex, groups.length, onClose]);

  const goToPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
      elapsedRef.current = 0;
    } else if (groupIndex > 0) {
      setGroupIndex((prev) => prev - 1);
      const prevGroup = groups[groupIndex - 1];
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
      elapsedRef.current = 0;
    }
  }, [storyIndex, groupIndex, groups]);

  useEffect(() => {
    if (isPaused) {
      clearTimer();
      return;
    }

    startTimeRef.current = Date.now() - elapsedRef.current;
    const interval = 50;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      elapsedRef.current = elapsed;
      const newProgress = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearTimer();
        goToNext();
      }
    }, interval);

    return clearTimer;
  }, [groupIndex, storyIndex, isPaused, goToNext, clearTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    const touch = e.changedTouches[0];
    const screenWidth = window.innerWidth;
    const x = touch.clientX;

    if (x < screenWidth * 0.3) {
      goToPrev();
    } else if (x > screenWidth * 0.7) {
      goToNext();
    }
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fadeIn">
      <div
        className="relative w-full h-full max-w-lg mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex gap-1 mb-3">
            {currentGroup.stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-50"
                  style={{
                    width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentGroup.user.avatar}
                alt={currentGroup.user.username}
                className="w-9 h-9 rounded-full object-cover border-2 border-white/50"
              />
              <div>
                <p className="text-white text-sm font-medium">{currentGroup.user.username}</p>
                <p className="text-white/60 text-xs">{formatTime(currentStory.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPaused && <Pause className="w-4 h-4 text-white/60" />}
              <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center">
          <img
            src={currentStory.media_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={goToPrev}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
        />
        <button
          onClick={goToNext}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
        />

        {groupIndex > 0 && (
          <button
            onClick={goToPrev}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white/70 hover:text-white hover:bg-black/50 transition-all z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {groupIndex < groups.length - 1 && (
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white/70 hover:text-white hover:bg-black/50 transition-all z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
