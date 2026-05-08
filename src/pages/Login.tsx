import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Phone, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

type LoginMode = 'email' | 'phone';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithPhone, loginWithQQ, sendSmsCode, isLoading } = useAuthStore();
  const [mode, setMode] = useState<LoginMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '邮箱或密码错误');
    }
  };

  const handleSendSms = async () => {
    if (smsCountdown > 0) return;
    if (!phone || !/^1\d{10}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    try {
      await sendSmsCode(phone);
      setSmsCountdown(60);
      const timer = setInterval(() => {
        setSmsCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || '发送验证码失败');
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || !smsCode) {
      setError('请填写手机号和验证码');
      return;
    }
    try {
      await loginWithPhone(phone, smsCode);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '验证码错误或已过期');
    }
  };

  const handleQQLogin = async () => {
    setError('');
    const qqOpenId = `qq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nickname = `QQ用户`;
    try {
      await loginWithQQ(qqOpenId, nickname);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'QQ登录失败');
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
          <div className="flex mb-6 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => { setMode('email'); setError(''); }}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                mode === 'email' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              邮箱登录
            </button>
            <button
              onClick={() => { setMode('phone'); setError(''); }}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                mode === 'phone' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              手机号登录
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {mode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
          ) : (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={11}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="验证码"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  maxLength={6}
                  className="w-full pl-11 pr-28 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={handleSendSms}
                  disabled={smsCountdown > 0}
                  className={cn(
                    'absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    smsCountdown > 0
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                  )}
                >
                  {smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码'}
                </button>
              </div>
              <div className="text-xs text-gray-500 bg-white/5 rounded-lg p-2">
                💡 演示模式：验证码会打印在后端控制台中
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
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">其他登录方式</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={handleQQLogin}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12B7F5]/20 border border-[#12B7F5]/30 text-[#12B7F5] text-sm hover:bg-[#12B7F5]/30 transition-all disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 13.24c-.18.53-.5.98-.92 1.34.28.14.52.3.72.48.36.32.56.68.56 1.06 0 .96-1.38 1.74-3.08 1.74-.86 0-1.64-.18-2.2-.48-.28.04-.56.06-.86.06-2.76 0-5-1.56-5-3.48 0-.86.42-1.66 1.12-2.28-.06-.28-.1-.58-.1-.88 0-1.94 1.74-3.52 3.88-3.52.2 0 .4.02.6.04.56-.82 1.68-1.38 2.98-1.38 1.84 0 3.34 1.04 3.34 2.32 0 .46-.18.88-.5 1.24.66.56 1.08 1.28 1.08 2.08 0 .22-.04.42-.12.62z"/>
              </svg>
              QQ登录
            </button>
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
