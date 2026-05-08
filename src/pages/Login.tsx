import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('登录失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-mint-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-warm-500/10 rounded-full blur-3xl animate-pulse" />

      <div className="w-full max-w-md relative z-10 animate-slideUp">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-primary-400 to-warm-400 bg-clip-text text-transparent mb-2">
            Social
          </h1>
          <p className="text-gray-400 text-sm">连接世界，分享精彩</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">登录账号</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 rounded-xl font-medium text-white transition-all duration-200',
                'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
                'hover:shadow-lg hover:shadow-primary-500/25',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">或</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {['微信', 'QQ', '微博'].map((name) => (
              <button
                key={name}
                className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 hover:text-white transition-all"
              >
                {name}
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            还没有账号？
            <Link to="/register" className="text-primary-400 hover:text-primary-300 ml-1 transition-colors">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
