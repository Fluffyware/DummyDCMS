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
    // Restore session from localStorage or initialize with default demo user (Rizal)
    try {
      const stored = localStorage.getItem('qhsse_demo_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const matched = ALL_USERS.find(u => u.id === parsed.id || u.email === parsed.email || u.username === parsed.username);
        if (matched) {
          setUser(matched);
          localStorage.setItem('qhsse_demo_user', JSON.stringify(matched));
        } else if (parsed.role && DEMO_USERS[parsed.role as UserRole]) {
          const freshUser = DEMO_USERS[parsed.role as UserRole];
          setUser(freshUser);
          localStorage.setItem('qhsse_demo_user', JSON.stringify(freshUser));
        } else {
          setUser(ALL_USERS[0]);
          localStorage.setItem('qhsse_demo_user', JSON.stringify(ALL_USERS[0]));
        }
      } else {
        const defaultUser = ALL_USERS[0];
        setUser(defaultUser);
        localStorage.setItem('qhsse_demo_user', JSON.stringify(defaultUser));
      }
    } catch {
      const defaultUser = ALL_USERS[0];
      setUser(defaultUser);
    }
    setIsLoading(false);
  }, []);

  const loginAsUser = async (userId: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 400));
    const target = ALL_USERS.find(u => u.id === userId);
    if (target) {
      setUser(target);
      localStorage.setItem('qhsse_demo_user', JSON.stringify(target));
      return true;
    }
    return false;
  };

  const loginWithCredentials = async (
    usernameInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 350));
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Find matching user by username, email, or department code
    let target = ALL_USERS.find(
      u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
    );

    // Support code aliases and full department names
    if (!target) {
      if (cleanUser === 'rizal') target = ALL_USERS.find(u => u.id === 'admin-rizal');
      else if (cleanUser === 'khabil') target = ALL_USERS.find(u => u.id === 'admin-khabil');
      else if (cleanUser === 'gt' || cleanUser === 'geotechnical' || cleanUser === 'geo') target = ALL_USERS.find(u => u.id === 'staff-geo');
      else if (cleanUser === 'op' || cleanUser === 'operations' || cleanUser === 'ops') target = ALL_USERS.find(u => u.id === 'staff-ops');
      else if (cleanUser === 'en' || cleanUser === 'engineering' || cleanUser === 'eng') target = ALL_USERS.find(u => u.id === 'staff-eng');
      else if (cleanUser === 'hr' || cleanUser === 'ga' || cleanUser === 'hr.ga' || cleanUser === 'hr & general affairs') target = ALL_USERS.find(u => u.id === 'staff-hr');
      else if (cleanUser === 'fa' || cleanUser === 'finance' || cleanUser === 'fin' || cleanUser === 'finance & accounting') target = ALL_USERS.find(u => u.id === 'staff-fin');
      else if (cleanUser === 'it' || cleanUser === 'information technology') target = ALL_USERS.find(u => u.id === 'staff-it');
      else if (cleanUser === 'ev' || cleanUser === 'environment' || cleanUser === 'env') target = ALL_USERS.find(u => u.id === 'staff-env');
      else if (cleanUser === 'cl' || cleanUser === 'commercial' || cleanUser === 'com' || cleanUser === 'commercial & logistics') target = ALL_USERS.find(u => u.id === 'staff-com');
    }

    // Production security: Generic error message for either invalid username or invalid password
    if (!target || cleanPass !== '12345') {
      return {
        success: false,
        error: 'Username atau password salah. Silakan periksa kembali.',
      };
    }

    setUser(target);
    localStorage.setItem('qhsse_demo_user', JSON.stringify(target));
    return { success: true };
  };

  const login = async (role: UserRole, _email?: string, _password?: string, userId?: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 400));
    let target = userId ? ALL_USERS.find(u => u.id === userId) : null;
    if (!target) {
      target = DEMO_USERS[role] || ALL_USERS[0];
    }
    if (target) {
      setUser(target);
      localStorage.setItem('qhsse_demo_user', JSON.stringify(target));
      return true;
    }
    return false;
  };

  const logout = () => {
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
