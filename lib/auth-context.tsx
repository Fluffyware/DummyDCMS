'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, ALL_USERS, DEMO_USERS } from './mock-data';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (role: UserRole, email?: string, password?: string, userId?: string) => Promise<boolean>;
  loginAsUser: (userId: string) => Promise<boolean>;
  loginWithCredentials: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  availableUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  loginAsUser: async () => false,
  loginWithCredentials: async () => ({ success: false }),
  logout: () => {},
  availableUsers: ALL_USERS,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check real server session on mount
    const verifyServerSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            localStorage.setItem('qhsse_demo_user', JSON.stringify(data.user));
            setIsLoading(false);
            return;
          }
        }

        // If server session is not authenticated, clear any stale client state
        setUser(null);
        localStorage.removeItem('qhsse_demo_user');
      } catch (err) {
        console.warn('Session verification error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyServerSession();
  }, []);

  const loginAsUser = async (_userId: string): Promise<boolean> => {
    // In production, switching accounts directly without password is disabled for security
    return false;
  };

  const loginWithCredentials = async (
    usernameInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('qhsse_demo_user', JSON.stringify(data.user));
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Username atau password salah. Silakan periksa kembali.',
      };
    } catch (err: any) {
      console.error('Login request error:', err);
      return {
        success: false,
        error: 'Terjadi gangguan koneksi saat menghubungi server autentikasi.',
      };
    }
  };

  const login = async (role: UserRole, _email?: string, _password?: string, userId?: string): Promise<boolean> => {
    let target = userId ? ALL_USERS.find(u => u.id === userId) : null;
    if (!target) {
      target = DEMO_USERS[role] || ALL_USERS[0];
    }
    if (target) {
      const res = await loginWithCredentials(target.username, '12345');
      return res.success;
    }
    return false;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (err) {
      console.warn('Logout API error:', err);
    }
    setUser(null);
    localStorage.removeItem('qhsse_demo_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsUser, loginWithCredentials, logout, availableUsers: ALL_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
