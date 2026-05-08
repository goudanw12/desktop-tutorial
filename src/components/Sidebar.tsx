import { TrendingUp } from 'lucide-react';
import UserCard from './UserCard';
import type { UserProfile } from '@/types';

const MOCK_USERS: UserProfile[] = [
  { id: 'r1', username: '设计师小林', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lin', bio: 'UI/UX 设计师', coverImage: '', followersCount: 1200, followingCount: 0, postsCount: 0 },
  { id: 'r2', username: '摄影师阿杰', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jie2', bio: '风光摄影师', coverImage: '', followersCount: 890, followingCount: 0, postsCount: 0 },
  { id: 'r3', username: '美食家小美', email: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mei2', bio: '美食博主', coverImage: '', followersCount: 5600, followingCount: 0, postsCount: 0 },
];

const TRENDING_TOPICS = [
  { tag: '周末出行', count: '2.3万讨论' },
  { tag: '美食探店', count: '1.8万讨论' },
  { tag: '摄影技巧', count: '9,800讨论' },
  { tag: '健身打卡', count: '7,500讨论' },
  { tag: '读书分享', count: '5,200讨论' },
];

export default function Sidebar() {
  return (
    <div className="space-y-4 sticky top-6">
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">推荐关注</h3>
        <div className="divide-y divide-gray-100 dark:divide-dark-700">
          {MOCK_USERS.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">热门话题</h3>
        </div>
        <div className="space-y-3">
          {TRENDING_TOPICS.map((topic, idx) => (
            <button key={topic.tag} className="w-full text-left group">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-300 dark:text-dark-500">{idx + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-500 transition-colors">
                    #{topic.tag}
                  </p>
                  <p className="text-xs text-gray-400">{topic.count}</p>
                </div>
              </div>
            </button>
          ))}
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
