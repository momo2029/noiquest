import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { api } from '../../services/api';

interface EmailRegisterProps {
  onBack: () => void;
}

export default function EmailRegister({ onBack }: EmailRegisterProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1: 输入邮箱, 2: 输入验证码和密码
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendVerificationCode, emailRegister } = useAuth();

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await sendVerificationCode(email);
      setCodeCountdown(60);

      // 开发模式下，如果返回了验证码，自动填充
      if (result && result.code) {
        setCode(result.code);
        alert(t('auth.codeAutoFilled', { code: result.code }));
      }

      const timer = setInterval(() => {
        setCodeCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError((err as Error).message || t('auth.sendCodeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateEmail(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }
    if (!inviteCode.trim()) {
      setError(t('auth.enterInviteCode'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.verifyInviteCode(inviteCode.trim());
      setStep(2);
    } catch (err) {
      setError((err as Error).message || t('auth.invalidInviteCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!code || code.length !== 6) {
      setError(t('auth.enter6DigitCode'));
      return;
    }
    if (!password || password.length < 6) {
      setError(t('auth.passwordMinLengthError'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (!name.trim()) {
      setError(t('auth.enterNameError'));
      return;
    }



    setLoading(true);
    setError('');
    try {
      await emailRegister({
        email,
        code,
        password,
        name: name.trim(),
        role: role.toUpperCase() as 'STUDENT' | 'TEACHER',
        inviteCode: inviteCode.trim() || undefined,
      });
    } catch (err) {
      setError((err as Error).message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Logo */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🐿️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{t('auth.startJourney')}</h1>
          <p className="text-blue-100 mt-2">{t('auth.createLearningAccount')}</p>
        </div>

        {/* 表单 */}
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.enterEmail')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.inviteCode')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder={t('auth.enterInviteCode')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleNext}
                  disabled={loading || !validateEmail(email) || !inviteCode.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
                >
                  {loading ? t('common.loading') : t('common.next')}
                </button>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  {t('auth.hasAccount')}
                  <button
                    onClick={onBack}
                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                  >
                    {t('auth.goToLogin')}
                  </button>
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-4">
                {/* 验证码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.verificationCode')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={t('auth.enterVerificationCode')}
                      maxLength={6}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSendCode}
                      disabled={loading || codeCountdown > 0}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
                    >
                      {codeCountdown > 0
                        ? t('auth.resendAfter', { seconds: codeCountdown })
                        : t('auth.getVerificationCode')}
                    </button>
                  </div>
                </div>

                {/* 密码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.setPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordHint')}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* 确认密码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.confirmPassword')}
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.reenterPassword')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                    disabled={loading}
                  />
                </div>

                {/* 姓名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.enterName')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                    disabled={loading}
                  />
                </div>

                {/* 角色选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.role')}
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRole('student')}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        role === 'student'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t('auth.student')}
                    </button>
                    <button
                      onClick={() => setRole('teacher')}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        role === 'teacher'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t('auth.teacher')}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
                >
                  {loading ? t('auth.registering') : t('auth.register')}
                </button>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={16} />
                  {t('common.back')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
