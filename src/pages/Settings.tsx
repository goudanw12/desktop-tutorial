import { useState } from 'react';
import { ArrowLeft, User, Lock, Shield, Palette, LogOut, ChevronRight, X, Save, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { put, post as apiPost } from '@/lib/api';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, fetchMe } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await put('/users/profile', {
        username: editForm.username,
        bio: editForm.bio,
        phone: editForm.phone || undefined,
      });
      await fetchMe();
      setMessage('资料更新成功');
      setTimeout(() => { setMessage(''); setShowEditProfile(false); }, 1500);
    } catch (err: any) {
      setMessage(err.message || '更新失败');
    }
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('两次输入的新密码不一致');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage('新密码至少6位');
      return;
    }
    setIsSaving(true);
    setMessage('');
    try {
      await apiPost('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage('密码修改成功');
      setTimeout(() => { setMessage(''); setShowChangePassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }, 1500);
    } catch (err: any) {
      setMessage(err.message || '密码修改失败');
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePrivacyChange = async (field: string, value: boolean) => {
    try {
      await put('/users/profile', { [field]: value ? 1 : 0 });
      if (field === 'is_private') setIsPrivate(value);
    } catch {}
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="md:hidden flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="font-display text-lg font-bold text-gray-900 dark:text-white">设置</h1>
      </div>

      <h1 className="hidden md:block font-display text-xl font-bold text-gray-900 dark:text-white mb-6">设置</h1>

      <div className="space-y-4">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">账号设置</h3>
          </div>

          <button
            onClick={() => { setEditForm({ username: user?.username || '', bio: user?.bio || '', phone: '' }); setShowEditProfile(true); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-500" />
            </span>
            <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300">编辑资料</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => { setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setShowChangePassword(true); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-warm-50 dark:bg-warm-900/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-warm-600" />
            </span>
            <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300">修改密码</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">隐私设置</h3>
          </div>

          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-8 h-8 rounded-lg bg-mint-50 dark:bg-mint-900/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-mint-600" />
            </span>
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">私密账号</span>
            <button
              onClick={() => { setIsPrivate(!isPrivate); handlePrivacyChange('is_private', !isPrivate); }}
              className={cn(
                'w-11 h-6 rounded-full transition-all duration-200 relative',
                isPrivate ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-600'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                isPrivate ? 'translate-x-5.5' : 'translate-x-0.5'
              )} />
            </button>
          </div>

          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-500" />
            </span>
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">允许评论</span>
            <button
              onClick={() => setAllowComments(!allowComments)}
              className={cn(
                'w-11 h-6 rounded-full transition-all duration-200 relative',
                allowComments ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-600'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                allowComments ? 'translate-x-5.5' : 'translate-x-0.5'
              )} />
            </button>
          </div>

          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-500" />
            </span>
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">允许私信</span>
            <button
              onClick={() => setAllowMessages(!allowMessages)}
              className={cn(
                'w-11 h-6 rounded-full transition-all duration-200 relative',
                allowMessages ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-600'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                allowMessages ? 'translate-x-5.5' : 'translate-x-0.5'
              )} />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">外观设置</h3>
          </div>

          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-600 flex items-center justify-center">
              <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </span>
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">深色模式</span>
            <button
              onClick={toggleTheme}
              className={cn(
                'w-11 h-6 rounded-full transition-all duration-200 relative',
                theme === 'dark' ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-600'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                theme === 'dark' ? 'translate-x-5.5' : 'translate-x-0.5'
              )} />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-500" />
            </span>
            <span className="flex-1 text-left text-sm text-red-500 font-medium">退出登录</span>
          </button>
        </div>
      </div>

      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditProfile(false)}>
          <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">编辑资料</h3>
              <button onClick={() => setShowEditProfile(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
                <input
                  value={editForm.username}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">简介</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">手机号</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="选填"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              {message && (
                <p className={cn('text-sm', message.includes('成功') ? 'text-mint-600' : 'text-red-500')}>{message}</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-dark-600 flex justify-end gap-3">
              <button onClick={() => setShowEditProfile(false)} className="px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all">取消</button>
              <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-1.5 px-6 py-2 rounded-full text-sm bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg transition-all disabled:opacity-50">
                <Save className="w-4 h-4" />
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowChangePassword(false)}>
          <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">修改密码</h3>
              <button onClick={() => setShowChangePassword(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">当前密码</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">新密码</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">确认新密码</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              {message && (
                <p className={cn('text-sm', message.includes('成功') ? 'text-mint-600' : 'text-red-500')}>{message}</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-dark-600 flex justify-end gap-3">
              <button onClick={() => setShowChangePassword(false)} className="px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all">取消</button>
              <button onClick={handleChangePassword} disabled={isSaving} className="flex items-center gap-1.5 px-6 py-2 rounded-full text-sm bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg transition-all disabled:opacity-50">
                <Save className="w-4 h-4" />
                {isSaving ? '修改中...' : '确认修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
