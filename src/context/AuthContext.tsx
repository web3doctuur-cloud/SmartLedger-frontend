'use client';

import axios from 'axios';
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface DecodedToken {
  userId?: string;
  sub?: string;
  email?: string;
  [key: string]: unknown;
}

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  initializeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const flattenApiErrors = (errors: unknown): string => {
  if (Array.isArray(errors)) {
    return errors.filter(Boolean).join('. ');
  }

  if (errors && typeof errors === 'object') {
    return Object.values(errors as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(Boolean)
      .join('. ');
  }

  return '';
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Server is waking up. Please try again in 30 seconds.';
  }

  if (error.response?.status === 401) {
    return 'Invalid email or password';
  }

  const data = error.response?.data as
    | { message?: string; title?: string; errors?: unknown }
    | string
    | undefined;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    const flattenedErrors = flattenApiErrors(data.errors);
    if (flattenedErrors) {
      return flattenedErrors;
    }

    if (data.message) {
      return data.message;
    }

    if (data.title) {
      return data.title;
    }
  }

  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = useCallback(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token) as DecodedToken;
      const rolesClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const roles = Array.isArray(rolesClaim) ? rolesClaim : rolesClaim ? [rolesClaim] : [];

      setUser({
        id: decoded.userId || decoded.sub || '',
        email: decoded.email || '',
        roles,
      });
    } catch (error) {
      console.error('Token decode error:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post('/Auth/login', {
        email: email.trim(),
        password,
      });

      const { token, email: userEmail, roles, userId } = response.data as {
        token?: string;
        email?: string;
        roles?: string[];
        userId?: string;
      };

      if (!token) {
        throw new Error('No token received');
      }

      localStorage.setItem('token', token);
      setUser({
        id: userId || '',
        email: userEmail || email.trim(),
        roles: roles || [],
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Login failed') };
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    if (password.trim().length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    try {
      const response = await api.post('/Auth/register', {
        email: email.trim(),
        password,
      });

      if (response.status === 200) {
        return login(email, password);
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Registration failed') };
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const isAdmin = user?.roles?.includes('Admin') || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        initializeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
