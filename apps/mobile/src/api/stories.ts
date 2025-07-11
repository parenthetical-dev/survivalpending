import { apiClient, retryWithBackoff } from '../config/api';

export interface Story {
  id: string;
  userId: string;
  content: string;
  refinedContent?: string;
  voiceId?: string;
  audioUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  category?: string;
  createdAt: string;
  user: {
    username: string;
  };
}

export interface StoryFilters {
  hasAudio?: boolean;
  timeRange?: 'all' | 'today' | 'week' | 'month';
  category?: string;
  state?: string;
  sort?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface SubmitStoryData {
  content: string;
  refinedContent?: string;
  voiceId: string;
  audioUrl?: string;
  category?: string;
}

export const storiesApi = {
  async getStories(filters: StoryFilters = {}): Promise<{
    stories: Story[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get('/api/stories', { params: filters });
    return response.data;
  },

  async getStory(id: string): Promise<Story> {
    const response = await apiClient.get(`/api/stories/${id}`);
    return response.data;
  },

  async getUserStories(): Promise<Story[]> {
    const response = await apiClient.get('/api/user/stories');
    return response.data.stories;
  },

  async submitStory(data: SubmitStoryData): Promise<Story> {
    const response = await apiClient.post('/api/story/submit', data);
    return response.data;
  },

  async getMapData(): Promise<{
    states: Array<{
      state: string;
      count: number;
    }>;
  }> {
    const response = await apiClient.get('/api/stories/map-data-synced');
    return response.data;
  },

  async refineStory(content: string): Promise<{
    refined: string;
    original: string;
  }> {
    const response = await retryWithBackoff(() => 
      apiClient.post('/api/ai/refine', { content })
    );
    return response.data;
  },

  async categorizeStory(content: string): Promise<{
    category: string;
    confidence: number;
  }> {
    const response = await apiClient.post('/api/ai/categorize', { content });
    return response.data;
  },
};