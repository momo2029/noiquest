import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, LoginRequest, RegisterRequest } from '../types';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  emailLogin: (email: string, password: string) => Promise<void>;
  emailRegister: (data: {
    email: string;
    code: string;
    password: string;
    name: string;
    role?: 'STUDENT' | 'TEACHER';
    inviteCode?: string;
  }) => Promise<void>;
  sendVerificationCode: (email: string) => Promise<{ message: string; code?: string }>;
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
    code: string;
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
    return api.sendVerificationCode(email);
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

  return (
    <AuthContext.Provider value={{ ...state, login, register, emailLogin, emailRegister, sendVerificationCode, logout }}>
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
