import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, LoginRequest, RegisterRequest } from '../types';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  userId: string | null;
  isActivated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  emailLogin: (email: string, password: string) => Promise<void>;
  emailRegister: (data: {
    email: string;
    password: string;
    name: string;
    role?: 'STUDENT' | 'TEACHER';
    inviteCode?: string;
  }) => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  activateAccount: (email: string, code: string, name?: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: api.getToken(),
    isAuthenticated: false,
    isLoading: true,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  // 初始化时确保用户存在（匿名或已登录）
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 先尝试确保用户存在
        const userData = await api.ensureUser();
        setUserId(userData.userId);
        setIsActivated(userData.isActivated);

        // 如果已激活，获取完整用户信息
        if (userData.isActivated) {
          try {
            const user = await api.getCurrentUser();
            setState({
              user,
              token: api.getToken(),
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            // 获取用户信息失败，保持匿名状态
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          // 匿名用户
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await api.login(data);
    setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (data: RegisterRequest) => {
    const response = await api.register(data);
    setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const emailLogin = async (email: string, password: string) => {
    const response = await api.emailLogin(email, password);
    setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const emailRegister = async (data: {
    email: string;
    password: string;
    name: string;
    role?: 'STUDENT' | 'TEACHER';
    inviteCode?: string;
  }) => {
    const response = await api.emailRegister(data);
    setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const sendVerificationCode = async (email: string) => {
    await api.sendVerificationCode(email);
  };

  const activateAccount = async (email: string, code: string, name?: string) => {
    if (!userId) {
      throw new Error('用户ID不存在');
    }

    await api.activateAccount({
      userId,
      email,
      code,
      name,
    });

    // 激活成功后，获取用户信息
    const user = await api.getCurrentUser();
    setState({
      user,
      token: api.getToken(),
      isAuthenticated: true,
      isLoading: false,
    });
    setIsActivated(true);
  };

  const updateProfile = async (data: { name?: string; avatar?: string }) => {
    const updatedUser = await api.updateProfile(data);
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updatedUser } : null,
    }));
  };

  const logout = () => {
    api.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setIsActivated(false);
    setUserId(null);
  };

  // 监听登录失效事件（单设备登录）
  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      alert('您的账号已在其他设备登录，请重新登录');
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session_expired', handleSessionExpired);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        userId,
        isActivated,
        login,
        register,
        emailLogin,
        emailRegister,
        sendVerificationCode,
        activateAccount,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
