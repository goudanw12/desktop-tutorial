import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const HOT_TAGS = ['周末出行', '美食探店', '摄影技巧', '健身打卡', '读书分享', '穿搭灵感', '音乐推荐'];

const MOCK_ITEMS = [
  { id: 'e1', image: 'https://picsum.photos/seed/e1/400/500', title: '城市夜景摄影', likes: 234 },
  { id: 'e2', image: 'https://picsum.photos/seed/e2/400/300', title: '日式料理', likes: 189 },
  { id: 'e3', image: 'https://picsum.photos/seed/e3/400/600', title: '山间小屋', likes: 456 },
  { id: 'e4', image: 'https://picsum.photos/seed/e4/400/350', title: '手冲咖啡', likes: 123 },
  { id: 'e5', image: 'https://picsum.photos/seed/e5/400/450', title: '海边日落', likes: 567 },
  { id: 'e6', image: 'https://picsum.photos/seed/e6/400/400', title: '街头艺术', likes: 345 },
  { id: 'e7', image: 'https://picsum.photos/seed/e7/400/550', title: '花艺设计', likes: 278 },
  { id: 'e8', image: 'https://picsum.photos/seed/e8/400/320', title: '极简家居', likes: 412 },
  { id: 'e9', image: 'https://picsum.photos/seed/e9/400/480', title: '晨跑风景', likes: 198 },
];

const CATEGORIES = ['全部', '摄影', '美食', '旅行', '设计', '音乐', '运动'];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4 md:hidden">探索</h1>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索话题、用户或内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-dark-700 border-0 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
          />
        </div>

        {showSearch && (
          <div className="mb-4 animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">热搜</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {HOT_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                activeCategory === cat
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="columns-2 gap-3 space-y-3">
        {MOCK_ITEMS.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid group cursor-pointer animate-fadeIn"
          >
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="text-white/70 text-xs">❤️ {item.likes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
