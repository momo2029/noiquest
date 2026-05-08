import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ActivatePage() {
  const navigate = useNavigate();
  const { sendVerificationCode, activateAccount } = useAuth();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('邮箱格式不正确');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await sendVerificationCode(email);
      setStep('code');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError((err as Error).message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await activateAccount(email, code, name || undefined);
      navigate('/');
    } catch (err) {
      setError((err as Error).message || '激活失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🐿️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">激活账号</h1>
          <p className="text-blue-100 mt-2">保存你的学习进度</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="输入你的邮箱"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
              >
                {loading ? '发送中...' : '发送验证码'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleActivate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="输入6位验证码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black text-center text-2xl tracking-widest"
                  disabled={loading}
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  验证码已发送至 {email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  昵称（可选）
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入你的昵称"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Check size={20} />
                {loading ? '激活中...' : '激活账号'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                disabled={loading || countdown > 0}
                className="w-full py-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 text-sm"
              >
                {countdown > 0 ? `${countdown}秒后可重新发送` : '重新发送验证码'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
