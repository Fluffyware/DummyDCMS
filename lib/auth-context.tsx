'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Only import types from mock-data — never the user arrays (would leak to client bundle)
export type UserRole = 'staff' | 'admin';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  roleName?: string;
  department: string;
  position: string;
  avatar: string;
}

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
  availableUsers: [],
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify server session on mount — this is the single source of truth
    const verifyServerSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setIsLoading(false);
            return;
          }
        }
        setUser(null);
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
    // Direct account switching without password is disabled in production
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

  const login = async (role: UserRole, _email?: string, _password?: string, _userId?: string): Promise<boolean> => {
    // In production, use loginWithCredentials with real credentials
    // This fallback only for backward compat
    const defaultCreds: Record<UserRole, string> = { admin: 'rizal', staff: 'GT' };
    const res = await loginWithCredentials(defaultCreds[role] || 'rizal', '12345');
    return res.success;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (err) {
      console.warn('Logout API error:', err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsUser, loginWithCredentials, logout, availableUsers: [] }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
