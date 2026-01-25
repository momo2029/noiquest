import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim() || !name.trim()) {
      setError('请填写所有必填项');
      return;
    }

    if (username.length < 3) {
      setError('用户名至少需要3个字符');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: username.trim(),
        password,
        name: name.trim(),
        role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#235390] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-3 shadow-lg shadow-green-500/30">
            <span className="text-3xl">🐿️</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">
            NOI<span className="text-[#58cc02]">Quest</span>
          </h1>
          <p className="text-blue-200 text-sm">信息学奥赛 C++ 训练营</p>
        </div>

        {/* 注册表单 */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
            创建账号
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 角色选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择身份
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    role === 'STUDENT'
                      ? 'border-[#58cc02] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🧑‍💻</div>
                  <p className={`font-semibold text-sm ${role === 'STUDENT' ? 'text-[#58cc02]' : 'text-gray-700'}`}>
                    我是选手
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('TEACHER')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    role === 'TEACHER'
                      ? 'border-[#58cc02] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">👨‍🏫</div>
                  <p className={`font-semibold text-sm ${role === 'TEACHER' ? 'text-[#58cc02]' : 'text-gray-700'}`}>
                    我是教练
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="3-20个字符"
                className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#58cc02] transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'STUDENT' ? '昵称' : '姓名'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'STUDENT' ? '给自己起个酷炫的名字' : '输入您的姓名'}
                className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#58cc02] transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6个字符"
                  className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#58cc02] transition-colors pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#58cc02] transition-colors"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#58cc02] hover:bg-[#4caf00] disabled:bg-gray-300 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  注册中...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  注册
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              已有账号？{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#58cc02] hover:text-[#4caf00] font-semibold"
              >
                立即登录
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
