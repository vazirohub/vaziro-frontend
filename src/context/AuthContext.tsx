import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: { name: string; phone: string; email?: string; password: string; role: 'CUSTOMER' | 'PROFESSIONAL' }) => Promise<void>;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  loginWithOtp: (payload: any) => Promise<any>;
  completeSignup: (payload: any) => Promise<any>;
  logout: () => void;
  updateUser: (user: User) => void;
  openAuthModal: (role?: 'CUSTOMER' | 'PROFESSIONAL', initialIdentifier?: string, mode?: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'OTP_LOGIN') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  defaultRole: 'CUSTOMER' | 'PROFESSIONAL';
  initialIdentifier: string;
  initialMode: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'OTP_LOGIN';
  setInitialMode: (mode: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'OTP_LOGIN') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vaziro_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  // Instant load: If user is already cached in localStorage, don't stall UI with full-screen spinner
  const [isLoading, setIsLoading] = useState(() => {
    const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('vaziro_token'));
    const hasUser = typeof window !== 'undefined' && Boolean(localStorage.getItem('vaziro_user'));
    return hasToken && !hasUser;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [defaultRole, setDefaultRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>('CUSTOMER');
  const [initialIdentifier, setInitialIdentifier] = useState('');
  const [initialMode, setInitialMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'OTP_LOGIN'>('LOGIN');

  useEffect(() => {
    const token = localStorage.getItem('vaziro_token');
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.data.success && res.data.data) {
            setUser(res.data.data.user);
            localStorage.setItem('vaziro_user', JSON.stringify(res.data.data.user));
          }
        })
        .catch((err: any) => {
          if (err.response?.status === 401) {
            // Token is dead/expired: clear stale state immediately
            localStorage.removeItem('vaziro_token');
            localStorage.removeItem('vaziro_user');
            setUser(null);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('vaziro:auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('vaziro:auth_expired', handleAuthExpired);
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    const cleanId = identifier.trim();

    try {
      const res = await api.login(cleanId, password);
      if (res.data.success && res.data.data) {
        localStorage.setItem('vaziro_token', res.data.data.accessToken);
        localStorage.setItem('vaziro_user', JSON.stringify(res.data.data.user));
        localStorage.setItem('vaziro_last_login_id', cleanId);
        setUser(res.data.data.user);
        setIsAuthModalOpen(false);
        return;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.error?.message || err.message || 'Invalid mobile/email or password.');
    }
  };

  const register = async (payload: { name: string; phone: string; email?: string; password: string; role: 'CUSTOMER' | 'PROFESSIONAL' }) => {
    try {
      const res = await api.register(payload);
      if (res.data.success && res.data.data) {
        localStorage.setItem('vaziro_token', res.data.data.accessToken);
        localStorage.setItem('vaziro_user', JSON.stringify(res.data.data.user));
        setUser(res.data.data.user);
        setIsAuthModalOpen(false);
        return;
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.error?.message || err.message || 'Registration failed.');
    }
  };

  const loginWithPassword = login;

  const loginWithOtp = async (payload: {
    phone?: string;
    mobile?: string;
    otp?: string;
    role?: 'CUSTOMER' | 'PROFESSIONAL';
    firstName?: string;
    lastName?: string;
    purpose?: string;
    msg91Verified?: boolean;
    msg91Token?: string;
  }) => {
    try {
      const res = await api.verifyOtp(payload);
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        if (!data.isNewUser && data.accessToken && data.user) {
          localStorage.setItem('vaziro_token', data.accessToken);
          localStorage.setItem('vaziro_user', JSON.stringify(data.user));
          const phoneIdentifier = payload.mobile || payload.phone || data.user.phone || '';
          if (phoneIdentifier) {
            localStorage.setItem('vaziro_last_login_id', phoneIdentifier);
          }
          setUser(data.user);
          setIsAuthModalOpen(false);
        }
        return data;
      }
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error?.message || err.message || 'OTP verification failed. Please try again.');
    }
  };

  const completeSignup = async (payload: {
    mobile?: string;
    signupToken?: string;
    role: 'CUSTOMER' | 'PROFESSIONAL';
    name: string;
    email: string;
    city?: string;
    businessName?: string;
    category?: string;
    experience?: number | string;
  }) => {
    try {
      const res = await api.completeSignup(payload);
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        if (data.accessToken && data.user) {
          localStorage.setItem('vaziro_token', data.accessToken);
          localStorage.setItem('vaziro_user', JSON.stringify(data.user));
          if (payload.mobile) {
            localStorage.setItem('vaziro_last_login_id', payload.mobile);
          }
          setUser(data.user);
          setIsAuthModalOpen(false);
        }
        return data;
      }
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error?.message || err.message || 'Registration failed.');
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('vaziro_token');
    localStorage.removeItem('vaziro_user');
    setUser(null);
  };

  const openAuthModal = (
    role: 'CUSTOMER' | 'PROFESSIONAL' = 'CUSTOMER',
    initialId?: string,
    mode?: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'OTP_LOGIN'
  ) => {
    setDefaultRole(role);
    setInitialIdentifier(initialId || '');
    if (mode) {
      setInitialMode(mode);
    }
    setIsAuthModalOpen(true);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('vaziro_user', JSON.stringify(updatedUser));
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        loginWithPassword,
        loginWithOtp,
        completeSignup,
        logout,
        updateUser,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        defaultRole,
        initialIdentifier,
        initialMode,
        setInitialMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
