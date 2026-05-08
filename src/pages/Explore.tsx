import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, TrendingUp, X, Clock, Users, FileText, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { get } from '@/lib/api';
import type { SearchResult, Post } from '@/types';

function mapApiPost(p: any): Post {
  return {
    id: p.id,
    userId: p.user_id,
    user: {
      id: p.user_id,
      username: p.username,
      email: '',
      avatar: p.avatar || `https://picsum.photos/seed/${p.user_id}/200/200`,
      bio: '',
      coverImage: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isVerified: !!p.is_verified,
    },
    content: p.content,
    images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []),
    likesCount: p.like_count || 0,
    commentsCount: p.comment_count || 0,
    sharesCount: p.share_count || 0,
    isLiked: !!p.is_liked,
    isBookmarked: !!p.is_bookmarked,
    isOwner: !!p.is_owner,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags || []),
    location: p.location || null,
    createdAt: p.created_at,
  };
}

const HOT_TAGS = ['周末出行', '美食探店', '摄影技巧', '健身打卡', '读书分享', '穿搭灵感', '音乐推荐'];

type SearchTab = 'users' | 'posts' | 'tags';

export default function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('users');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    } catch { return []; }
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await get<{ success: boolean; data: { posts: any[] } }>('/posts/feed?page=1&limit=20');
        setFeedPosts((res.data?.posts || []).map(mapApiPost));
      } catch {}
      setIsLoadingFeed(false);
    };
    fetchFeed();
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await get<{ success: boolean; data: { users: any[] } }>(`/search/suggestions?q=${encodeURIComponent(q)}`);
      setSuggestions(res.data?.users || []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSearch && searchQuery.trim()) {
        fetchSuggestions(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showSearch, fetchSuggestions]);

  const handleSearch = async (q?: string) => {
    const query = q || searchQuery;
    if (!query.trim()) return;
    setIsSearching(true);
    setShowSearch(false);

    setSearchHistory((prev) => {
      const updated = [query, ...prev.filter((h) => h !== query)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });

    try {
      const res = await get<{ success: boolean; data: SearchResult }>(`/search?q=${encodeURIComponent(query)}`);
      setSearchResult(res.data);
    } catch {
      setSearchResult({ users: [], posts: [], tags: [] });
    }
    setIsSearching(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleFocusInput = () => {
    setShowSearch(true);
  };

  const handleSelectSuggestion = (username: string) => {
    setSearchQuery(username);
    handleSearch(username);
  };

  const isSearchActive = searchResult !== null;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4 md:hidden">探索</h1>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索话题、用户或内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleFocusInput}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-11 pr-10 py-3 bg-gray-100 dark:bg-dark-700 border-0 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResult(null); setShowSearch(true); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showSearch && !isSearchActive && (
          <div className="mb-4 animate-fadeIn bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-600 overflow-hidden">
            {suggestions.length > 0 && searchQuery.trim() && (
              <div className="p-3 border-b border-gray-100 dark:border-dark-700">
                <p className="text-xs text-gray-400 mb-2 px-1">搜索建议</p>
                {suggestions.map((u: any) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectSuggestion(u.username)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <img src={u.avatar || `https://picsum.photos/seed/${u.id}/200/200`} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm text-gray-800 dark:text-gray-200">{u.username}</span>
                  </button>
                ))}
              </div>
            )}

            {searchHistory.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    搜索历史
                  </div>
                  <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-primary-500">清除</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((h) => (
                    <button
                      key={h}
                      onClick={() => { setSearchQuery(h); handleSearch(h); }}
                      className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!searchQuery.trim() && (
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">热门话题</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {HOT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); handleSearch(tag); }}
                      className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isSearchActive && (
          <div className="mb-4">
            <div className="flex gap-2 mb-4">
              {([
                { key: 'users' as SearchTab, label: '用户', icon: Users },
                { key: 'posts' as SearchTab, label: '动态', icon: FileText },
                { key: 'tags' as SearchTab, label: '话题', icon: Hash },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {isSearching ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {activeTab === 'users' && (
                  <div className="space-y-2">
                    {(searchResult?.users || []).length === 0 ? (
                      <div className="text-center py-12 text-gray-400 text-sm">未找到相关用户</div>
                    ) : (
                      (searchResult?.users || []).map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => navigate(`/profile/${u.id}`)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                        >
                          <img src={u.avatar || `https://picsum.photos/seed/${u.id}/200/200`} alt="" className="w-12 h-12 rounded-full object-cover" />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{u.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{u.bio || '暂无简介'}</p>
                          </div>
                          {u.is_verified && (
                            <span className="w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center text-[8px]">✓</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'posts' && (
                  <div className="space-y-3">
                    {(searchResult?.posts || []).length === 0 ? (
                      <div className="text-center py-12 text-gray-400 text-sm">未找到相关动态</div>
                    ) : (
                      (searchResult?.posts || []).map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => navigate(`/post/${p.id}`)}
                          className="w-full text-left p-3 rounded-xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-600 hover:shadow-md transition-all"
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{p.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">{p.username}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-primary-500">❤️ {p.like_count || 0}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'tags' && (
                  <div className="space-y-2">
                    {(searchResult?.tags || []).length === 0 ? (
                      <div className="text-center py-12 text-gray-400 text-sm">未找到相关话题</div>
                    ) : (
                      (searchResult?.tags || []).map((tag: any) => (
                        <button
                          key={tag.name}
                          onClick={() => navigate(`/topic/${tag.name}`)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                              <Hash className="w-5 h-5 text-primary-500" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">#{tag.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{tag.count} 条动态</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!isSearchActive && !showSearch && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">热门话题</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {HOT_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/topic/${tag}`)}
                  className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="columns-2 gap-3 space-y-3">
              {isLoadingFeed ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="break-inside-avoid">
                    <div className="animate-shimmer rounded-xl" style={{ height: `${150 + Math.random() * 150}px` }} />
                  </div>
                ))
              ) : (
                feedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="break-inside-avoid group cursor-pointer animate-fadeIn"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-600">
                      {post.images.length > 0 && (
                        <img
                          src={post.images[0]}
                          alt=""
                          className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{ aspectRatio: '3/4' }}
                        />
                      )}
                      {post.images.length === 0 && (
                        <div className="p-4" style={{ minHeight: '120px' }}>
                          <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-4">{post.content}</p>
                        </div>
                      )}
                      <div className="p-3">
                        {post.images.length > 0 && post.content && (
                          <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">{post.content}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <img src={post.user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{post.user.username}</span>
                          <span className="text-xs text-primary-500 ml-auto">❤️ {post.likesCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
