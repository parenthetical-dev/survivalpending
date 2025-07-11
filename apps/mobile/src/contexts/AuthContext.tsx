import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/auth';
import { STORAGE_KEYS } from '../config/api';
import type { LoginInput, SignupInput } from '../types/auth';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  signup: (credentials: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        // Verify token is still valid
        try {
          await authApi.getCurrentUser();
        } catch (error) {
          // Token invalid, clear auth
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginInput) => {
    const response = await authApi.login(credentials);
    setUser(response.user);
  };

  const signup = async (credentials: SignupInput) => {
    const response = await authApi.signup(credentials);
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
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