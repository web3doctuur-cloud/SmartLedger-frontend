'use client';

import React, { createContext, useContext, useState, useTransition, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface DecodedToken {
  userId?: string;
  sub?: string;
  email: string;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  const initializeAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token) as DecodedToken;
        const rolesClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const roles = Array.isArray(rolesClaim) ? rolesClaim : rolesClaim ? [rolesClaim] : [];
        startTransition(() => {
          setUser({
            id: decoded.userId || decoded.sub || '',
            email: decoded.email,
            roles,
          });
        });
      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Login attempt for:', email);
      
      const response = await api.post('/Auth/login', { 
        email: email.trim(), 
        password: password 
      });
      
      console.log('Login response:', response.data);
      
      const { token, email: userEmail, roles, userId } = response.data;
      
      if (!token) {
        throw new Error('No token received');
      }
      
      localStorage.setItem('token', token);
      setUser({ id: userId, email: userEmail, roles: roles || [] });
      
      return { success: true };
    } catch (error) {
      const err = error as { code?: string; message?: string; response?: { status?: number; data?: { message?: string; errors?: unknown } } };
      console.error('Login error:', err.response?.data);
      
      let errorMessage = 'Login failed';
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'Server is waking up. Please try again in 30 seconds.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Array.isArray(errors)
          ? errors.join(', ')
          : Object.values(errors as Record<string, unknown>).flat().join(', ');
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const passwordErrors: string[] = [];
    if (password.length < 6) {
      passwordErrors.push('Password must be at least 6 characters');
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push("Password must include a lowercase letter (a-z)");
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('Password must include an uppercase letter (A-Z)');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      passwordErrors.push('Password must include a special character (e.g. @, #, !)');
    }
    if (passwordErrors.length > 0) {
      return { success: false, error: passwordErrors.join('. ') };
    }

    try {
      console.log('Registration attempt for:', email);
      console.log('Sending data:', { email: email.trim(), password });
      
      const response = await api.post('/Auth/register', { 
        email: email.trim(), 
        password: password 
      });
      
      console.log('Registration response status:', response.status);
      console.log('Registration response data:', response.data);
      
      if (response.status === 200) {
        toast.success('Registration successful!');
        // Auto login after successful registration
        return login(email, password);
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      const err = error as { code?: string; message?: string; response?: { status?: number; data?: unknown } };
      console.error('Registration error full:', err);
      console.error('Registration error response:', err.response?.data);
      console.error('Registration error status:', err.response?.status);
      
      // Handle 400 Bad Request - likely validation errors or duplicate email
      if (err.response?.status === 400) {
        const errorData = err.response.data as { errors?: unknown; message?: string; title?: string };
        
        if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            return { success: false, error: errorData.errors.join('. ') };
          }

          const firstErrorKey = Object.keys(errorData.errors as Record<string, unknown>)[0];
          const firstErrorMessage = (errorData.errors as Record<string, unknown>)[firstErrorKey];
          const message = Array.isArray(firstErrorMessage)
            ? firstErrorMessage[0]
            : firstErrorMessage;
          return { success: false, error: (message as string) || 'Registration failed' };
        }
        
        if (errorData.message) {
          // Simple message format
          return { success: false, error: errorData.message };
        }
        
        if (errorData.title) {
          // ProblemDetails format
          return { success: false, error: errorData.title };
        }
        
        // If email already exists message in string
        if (typeof errorData === 'string') {
          return { success: false, error: errorData };
        }
        
        return { success: false, error: 'Registration failed. Please check your information.' };
      }
      
      // Handle 500 Server Error
      if (err.response?.status === 500) {
        return { success: false, error: 'Server error. Please try again later.' };
      }
      
      // Handle network errors (API sleeping on free tier)
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        return { success: false, error: 'Server is waking up. Please try again in 30 seconds.' };
      }
      
      return { success: false, error: (err.response?.data as { message?: string })?.message || 'Registration failed' };
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const isAdmin = user?.roles?.includes('Admin') || false;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      isLoading, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      initializeAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};