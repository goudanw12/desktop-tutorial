import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { get } from '@/lib/api';
import UserCard from './UserCard';
import type { UserProfile } from '@/types';

export default function Sidebar() {
  const navigate = useNavigate();
  const [recommendedUsers, setRecommendedUsers] = useState<UserProfile[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await get<{ success: boolean; data: { users: any[] } }>('/search/suggestions');
        setRecommendedUsers((res.data?.users || []).map((u: any) => ({
          id: u.id,
          username: u.username,
          email: '',
          avatar: u.avatar || `https://picsum.photos/seed/${u.id}/200/200`,
          bio: u.bio || '',
          coverImage: '',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isVerified: !!u.is_verified,
        })));
      } catch {}
    };

    const fetchTopics = async () => {
      try {
        const res = await get<{ success: boolean; data: { tags: { name: string; count: number }[] } }>('/search?q=');
        setTrendingTopics(res.data?.tags || []);
      } catch {}
    };

    fetchRecommendations();
    fetchTopics();
  }, []);

  return (
    <div className="space-y-4 sticky top-6">
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">推荐关注</h3>
        <div className="divide-y divide-gray-100 dark:divide-dark-700">
          {recommendedUsers.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-400">暂无推荐</div>
          ) : (
            recommendedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">热门话题</h3>
        </div>
        <div className="space-y-3">
          {trendingTopics.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-400">暂无话题</div>
          ) : (
            trendingTopics.slice(0, 5).map((topic, idx) => (
              <button
                key={topic.name}
                onClick={() => navigate(`/topic/${topic.name}`)}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-300 dark:text-dark-500">{idx + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-500 transition-colors">
                      #{topic.name}
                    </p>
                    <p className="text-xs text-gray-400">{topic.count} 条动态</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="px-2">
        <p className="text-xs text-gray-400 dark:text-dark-500">
          Social © 2026 · 关于 · 帮助 · 隐私 · 条款
        </p>
      </div>
    </div>
  );
}
