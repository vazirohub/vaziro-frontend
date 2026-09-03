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
  loginWithOtp: (payload: any) => Promise<void>;
  logout: () => void;
  openAuthModal: (role?: 'CUSTOMER' | 'PROFESSIONAL') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  defaultRole: 'CUSTOMER' | 'PROFESSIONAL';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [defaultRole, setDefaultRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>('CUSTOMER');

  useEffect(() => {
    const token = localStorage.getItem('vaziro_token');
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.data.success && res.data.data) {
            setUser(res.data.data.user);
          } else {
            localStorage.removeItem('vaziro_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('vaziro_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.login(identifier, password);
    if (res.data.success && res.data.data) {
      localStorage.setItem('vaziro_token', res.data.data.accessToken);
      setUser(res.data.data.user);
      setIsAuthModalOpen(false);
    } else {
      throw new Error(res.data.error?.message || 'Login failed');
    }
  };

  const register = async (payload: { name: string; phone: string; email?: string; password: string; role: 'CUSTOMER' | 'PROFESSIONAL' }) => {
    const res = await api.register(payload);
    if (res.data.success && res.data.data) {
      localStorage.setItem('vaziro_token', res.data.data.accessToken);
      setUser(res.data.data.user);
      setIsAuthModalOpen(false);
    } else {
      throw new Error(res.data.error?.message || 'Registration failed');
    }
  };

  const loginWithPassword = login;

  const loginWithOtp = async () => {
    // legacy fallback
  };

  const logout = () => {
    localStorage.removeItem('vaziro_token');
    setUser(null);
  };

  const openAuthModal = (role: 'CUSTOMER' | 'PROFESSIONAL' = 'CUSTOMER') => {
    setDefaultRole(role);
    setIsAuthModalOpen(true);
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
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        defaultRole,
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
