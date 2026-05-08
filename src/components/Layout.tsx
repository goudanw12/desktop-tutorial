import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusCircle, MessageCircle, Bell, Settings, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { get } from '@/lib/api';
import { REFRESH_UNREAD_EVENT } from '@/lib/events';
import Sidebar from './Sidebar';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/explore', icon: Compass, label: '探索' },
  { path: '/publish', icon: PlusCircle, label: '发布' },
  { path: '/messages', icon: MessageCircle, label: '消息' },
  { path: '/notifications', icon: Bell, label: '通知' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const [hasMessageUnread, setHasMessageUnread] = useState(false);
  const [hasNotificationUnread, setHasNotificationUnread] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const chatsRes = await get<{ success: boolean; data: any[] }>('/chats');
      const totalUnread = (chatsRes.data || []).reduce(
        (sum: number, chat: any) => sum + (chat.unread_count || 0),
        0
      );
      setMessageCount(totalUnread);
      setHasMessageUnread(totalUnread > 0);
    } catch {}

    try {
      const notifRes = await get<{ success: boolean; data: any[] }>('/notifications');
      const unread = (notifRes.data || []).filter((n: any) => !n.is_read).length;
      setNotificationCount(unread);
      setHasNotificationUnread(unread > 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 10000);

    const handleRefresh = () => fetchUnreadCounts();
    window.addEventListener(REFRESH_UNREAD_EVENT, handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener(REFRESH_UNREAD_EVENT, handleRefresh);
    };
  }, [fetchUnreadCounts]);

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isProfileActive = location.pathname === '/profile' || location.pathname.startsWith('/profile/');

  const renderUnreadBadge = (count: number, show: boolean) => {
    if (!show || count === 0) return null;
    if (count > 99) return <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[9px] rounded-full flex items-center justify-center font-medium">99+</span>;
    return <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-primary-500 text-white text-[9px] rounded-full flex items-center justify-center font-medium">{count}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 font-body">
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-600 flex-col z-30">
        <div className="p-6">
          <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Social
          </h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showUnread = item.path === '/notifications';
            const unread = showUnread ? notificationCount : (item.path === '/messages' ? messageCount : 0);
            const hasUnread = showUnread ? hasNotificationUnread : (item.path === '/messages' ? hasMessageUnread : false);

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'text-primary-500')} />
                <span>{item.label}</span>
                {renderUnreadBadge(unread, hasUnread)}
              </button>
            );
          })}
        </nav>

        <div className="p-3 space-y-1 border-t border-gray-200 dark:border-dark-600">
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              isProfileActive
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
            )}
          >
            <User className="w-5 h-5" />
            <span>个人主页</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              location.pathname === '/settings'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
            )}
          >
            <Settings className="w-5 h-5" />
            <span>设置</span>
          </button>
        </div>

        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-dark-600">
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 rounded-xl p-2 -m-2 transition-colors"
              onClick={() => navigate('/profile')}
            >
              <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-600 z-30 flex items-center px-4">
        <h1 className="font-display text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
          Social
        </h1>
      </header>

      <main className="md:ml-64 pt-14 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto flex">
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
          <div className="hidden lg:block w-80 flex-shrink-0 pl-6 pr-4 pt-6">
            <Sidebar />
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg border-t border-gray-200 dark:border-dark-600 z-30 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const hasUnread = item.path === '/notifications' ? hasNotificationUnread : (item.path === '/messages' ? hasMessageUnread : false);
          const count = item.path === '/notifications' ? notificationCount : (item.path === '/messages' ? messageCount : 0);

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 relative',
                isActive ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <div className="relative">
                <item.icon className={cn('w-5 h-5', item.path === '/publish' && 'w-7 h-7')} />
                {renderUnreadBadge(count, hasUnread)}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => navigate('/profile')}
          className={cn(
            'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200',
            isProfileActive ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">我的</span>
        </button>
      </nav>
    </div>
  );
}
