import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { verifyToken } from '@survivalpending/core';

interface User {
  id: string;
  username: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const storedUser = await SecureStore.getItemAsync('user');
      
      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        const verified = verifyToken(token);
        
        if (verified) {
          setUser(userData);
        } else {
          // Token expired, clear storage
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('user');
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    // This would call your API endpoint
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    const userData = {
      id: data.user.id,
      username: data.user.username,
      token: data.token,
    };

    // Store auth data securely
    await SecureStore.setItemAsync('authToken', data.token);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    
    setUser(userData);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
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