import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// API Configuration
export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
export const IS_DEV = Constants.expoConfig?.extra?.env === 'development';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  DRAFT_STORY: 'draft_story',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  CREDENTIALS_DOWNLOADED: 'credentials_downloaded',
} as const;

// Create axios instance with defaults
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    }
    
    // Format error message
    const responseData = error.response?.data as { message?: string } | undefined;
    const message = responseData?.message || 
                   error.message || 
                   'An unexpected error occurred';
    
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// Helper function for exponential backoff retry
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise<void>(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}