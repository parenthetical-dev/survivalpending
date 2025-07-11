import { apiClient, STORAGE_KEYS } from '../config/api';
import * as SecureStore from 'expo-secure-store';
import type { LoginInput, SignupInput } from '../types/auth';

interface AuthResponse {
  user: {
    id: string;
    username: string;
  };
  token: string;
}

export const authApi = {
  async signup(data: SignupInput): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
    
    // Store auth data
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    
    return response.data;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    
    // Store auth data
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error('Logout API error:', error);
    }
    
    // Clear local auth data
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETE);
  },

  async getCurrentUser() {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  async generateUsername(): Promise<string> {
    const response = await apiClient.get<{ username: string }>('/api/username/generate');
    return response.data.username;
  },
};