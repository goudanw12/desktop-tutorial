import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, checkUsername, checkPhone } = useAuthStore();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const checkUsernameAvailability = useCallback(async (value: string) => {
    if (value.length < 2) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const available = await checkUsername(value);
    setUsernameStatus(available ? 'available' : 'taken');
  }, [checkUsername]);

  const checkPhoneAvailability = useCallback(async (value: string) => {
    if (!/^1\d{10}$/.test(value)) {
      setPhoneStatus('idle');
      return;
    }
    setPhoneStatus('checking');
    const available = await checkPhone(value);
    setPhoneStatus(available ? 'available' : 'taken');
  }, [checkPhone]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);
    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkPhoneAvailability(phone);
    }, 500);
    return () => clearTimeout(timer);
  }, [phone, checkPhoneAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !phone || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('用户名已被占用');
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (phoneStatus === 'taken') {
      setError('手机号已注册');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    try {
      await register(username, phone, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-mint-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-72 h-72 bg-mint-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />

      <div className="w-full max-w-md relative z-10 animate-slideUp">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-mint-400 to-primary-400 bg-clip-text text-transparent mb-2">
            Social
          </h1>
          <p className="text-gray-400 text-sm">加入我们，开始社交之旅</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">创建账号</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="用户名（不可重复）"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn(
                  'w-full pl-11 pr-10 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
                  usernameStatus === 'available' ? 'border-mint-500/50 focus:ring-mint-500/50' :
                  usernameStatus === 'taken' ? 'border-red-500/50 focus:ring-red-500/50' :
                  'border-white/10 focus:ring-mint-500/50'
                )}
              />
              {usernameStatus === 'checking' && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">检查中...</span>
              )}
              {usernameStatus === 'available' && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mint-400" />
              )}
              {usernameStatus === 'taken' && (
                <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
              )}
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="tel"
                placeholder="手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={11}
                className={cn(
                  'w-full pl-11 pr-10 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
                  phoneStatus === 'available' ? 'border-mint-500/50 focus:ring-mint-500/50' :
                  phoneStatus === 'taken' ? 'border-red-500/50 focus:ring-red-500/50' :
                  'border-white/10 focus:ring-mint-500/50'
                )}
              />
              {phoneStatus === 'checking' && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">检查中...</span>
              )}
              {phoneStatus === 'available' && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mint-400" />
              )}
              {phoneStatus === 'taken' && (
                <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mint-500/50 focus:border-mint-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="password"
                placeholder="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mint-500/50 focus:border-mint-500/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || usernameStatus === 'taken' || phoneStatus === 'taken'}
              className={cn(
                'w-full py-3 rounded-xl font-medium text-white transition-all duration-200',
                'bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700',
                'hover:shadow-lg hover:shadow-mint-500/25',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? '注册中...' : '注册'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            已有账号？
            <Link to="/login" className="text-mint-400 hover:text-mint-300 ml-1 transition-colors">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
