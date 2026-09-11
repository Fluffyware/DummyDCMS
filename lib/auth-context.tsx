'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, DEMO_USERS } from './mock-data';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (role: UserRole, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage or initialize with default demo user
    try {
      const stored = localStorage.getItem('qhsse_demo_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === 'admin' || parsed.role === 'staff') {
          const freshUser = DEMO_USERS[parsed.role as UserRole];
          setUser(freshUser);
          localStorage.setItem('qhsse_demo_user', JSON.stringify(freshUser));
        } else {
          setUser(DEMO_USERS.admin);
          localStorage.setItem('qhsse_demo_user', JSON.stringify(DEMO_USERS.admin));
        }
      } else {
        const defaultUser = DEMO_USERS.admin;
        setUser(defaultUser);
        localStorage.setItem('qhsse_demo_user', JSON.stringify(defaultUser));
      }
    } catch {
      const defaultUser = DEMO_USERS.admin;
      setUser(defaultUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (role: UserRole, _email: string, _password: string): Promise<boolean> => {
    // Demo: accept any credentials, just use the role
    await new Promise(r => setTimeout(r, 800)); // simulate network
    const profile = DEMO_USERS[role];
    if (profile) {
      setUser(profile);
      localStorage.setItem('qhsse_demo_user', JSON.stringify(profile));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qhsse_demo_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
