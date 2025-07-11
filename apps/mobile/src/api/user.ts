import { apiClient } from '../config/api';

export interface UserDemographics {
  ageRange?: string;
  state?: string;
  genderIdentity?: string;
  racialIdentity?: string;
  urbanicity?: string;
}

export interface ShareStats {
  totalShares: number;
  platforms: {
    platform: string;
    count: number;
  }[];
}

export const userApi = {
  async saveDemographics(demographics: UserDemographics): Promise<void> {
    await apiClient.post('/api/user/demographics', demographics);
  },

  async getShareStats(): Promise<ShareStats> {
    const response = await apiClient.get('/api/user/shares');
    return response.data;
  },
};