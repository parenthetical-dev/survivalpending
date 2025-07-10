// Common types shared across all packages and apps

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Story-related types
export interface StoryBase {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryAudio {
  url: string;
  duration: number;
  voiceId: string;
}

// User-related types
export interface UserBase {
  id: string;
  username: string;
  createdAt: Date;
}

// Authentication types
export interface AuthTokenPayload {
  userId: string;
  type: 'user' | 'admin';
}

export interface AuthCredentials {
  username: string;
  password: string;
}