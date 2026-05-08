import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Shield, Palette, Moon, Sun, LogOut, ChevronRight, Bell, Eye, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
}

function SettingItem({ icon, label, value, onClick, destructive }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors',
        destructive && 'text-red-500'
      )}
    >
      <span className={cn('text-gray-500 dark:text-gray-400', destructive && 'text-red-500')}>{icon}</span>
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {value && <span className="text-xs text-gray-400">{value}</span>}
      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-dark-500" />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4 md:hidden">设置</h1>

      <div className="space-y-4">
        {user && (
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-dark-500" />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">账号设置</p>
          </div>
          <SettingItem icon={<User className="w-5 h-5" />} label="个人信息" value="已完善" onClick={() => {}} />
          <SettingItem icon={<Lock className="w-5 h-5" />} label="修改密码" onClick={() => {}} />
          <SettingItem icon={<Shield className="w-5 h-5" />} label="账号安全" onClick={() => {}} />
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">隐私设置</p>
          </div>
          <SettingItem icon={<Eye className="w-5 h-5" />} label="谁可以看我的动态" value="所有人" onClick={() => {}} />
          <SettingItem icon={<Globe className="w-5 h-5" />} label="位置信息" value="关闭" onClick={() => {}} />
          <SettingItem icon={<Bell className="w-5 h-5" />} label="通知设置" onClick={() => {}} />
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">外观设置</p>
          </div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <span className="text-gray-500 dark:text-gray-400">
              <Palette className="w-5 h-5" />
            </span>
            <span className="flex-1 text-left text-sm font-medium">主题模式</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              {theme === 'dark' ? '深色' : '浅色'}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-dark-500" />
          </button>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 overflow-hidden">
          {!showLogoutConfirm ? (
            <SettingItem
              icon={<LogOut className="w-5 h-5" />}
              label="退出登录"
              destructive
              onClick={() => setShowLogoutConfirm(true)}
            />
          ) : (
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">确定要退出登录吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-dark-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-sm text-white hover:bg-red-600 transition-all"
                >
                  退出
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-dark-500 pb-4">
          Social v1.0.0
        </p>
      </div>
    </div>
  );
}
