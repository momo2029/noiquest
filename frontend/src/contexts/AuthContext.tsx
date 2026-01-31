import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, LoginRequest, RegisterRequest } from '../types';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
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

  // 初始化时检查 token 有效性
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const user = await api.getCurrentUser();
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        // Token 无效，清除
        api.logout();
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
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
    <AuthContext.Provider value={{ ...state, login, register, emailLogin, emailRegister, updateProfile, logout }}>
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
