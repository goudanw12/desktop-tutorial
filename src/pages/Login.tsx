import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Phone, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

type LoginMode = 'email' | 'phone';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithPhone, sendSmsCode, isLoading } = useAuthStore();
  const [mode, setMode] = useState<LoginMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [lastSentCode, setLastSentCode] = useState('');
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
      const code = await sendSmsCode(phone);
      setLastSentCode(code);
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
              {lastSentCode && (
                <div className="p-3 rounded-xl bg-mint-500/20 border border-mint-500/30 text-mint-300 text-sm text-center">
                  验证码已发送：<span className="font-bold text-lg tracking-widest">{lastSentCode}</span>
                </div>
              )}
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
            <span className="text-xs text-gray-500">其他方式</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-sm cursor-not-allowed opacity-60"
              title="即将上线"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 13.24c-.18.53-.5.98-.92 1.34.28.14.52.3.72.48.36.32.56.68.56 1.06 0 .96-1.38 1.74-3.08 1.74-.86 0-1.64-.18-2.2-.48-.28.04-.56.06-.86.06-2.76 0-5-1.56-5-3.48 0-.86.42-1.66 1.12-2.28-.06-.28-.1-.58-.1-.88 0-1.94 1.74-3.52 3.88-3.52.2 0 .4.02.6.04.56-.82 1.68-1.38 2.98-1.38 1.84 0 3.34 1.04 3.34 2.32 0 .46-.18.88-.5 1.24.66.56 1.08 1.28 1.08 2.08 0 .22-.04.42-.12.62z"/>
              </svg>
              QQ 即将上线
            </button>
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-sm cursor-not-allowed opacity-60"
              title="即将上线"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M8.69 2C4.46 2 1 5.46 1 9.69c0 2.37 1.05 4.49 2.71 5.93l-.71 2.77c-.1.38.32.67.63.45l2.93-2.09c.71.2 1.46.31 2.23.31h.2c-.08-.42-.12-.86-.12-1.31C8.57 11.17 11.74 8 15.69 8h.2C15.1 4.61 12.24 2 8.69 2zM7 7.5a1 1 0 110-2 1 1 0 010 2zm3 0a1 1 0 110-2 1 1 0 010 2z"/>
                <path d="M23 15.69C23 12.27 20.23 9.5 16.81 9.5c-3.42 0-6.19 2.77-6.19 6.19s2.77 6.19 6.19 6.19c.6 0 1.18-.09 1.73-.24l2.28 1.63c.24.17.57-.05.49-.34l-.55-2.15C21.98 19.53 23 17.73 23 15.69zm-7.5-1a1 1 0 110-2 1 1 0 010 2zm3 0a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
              微信 即将上线
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
