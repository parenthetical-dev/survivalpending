import { apiClient } from '../config/api';

export interface CrisisResource {
  name: string;
  phone: string;
  text?: string;
  description: string;
  url?: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: 'Trans Lifeline',
    phone: '877-565-8860',
    description: 'Peer support for transgender people',
    url: 'https://translifeline.org',
  },
  {
    name: 'Trevor Project',
    phone: '1-866-488-7386',
    text: 'Text START to 678-678',
    description: '24/7 crisis support for LGBTQ youth',
    url: 'https://www.thetrevorproject.org',
  },
  {
    name: 'LGBTQ National Hotline',
    phone: '1-888-843-4564',
    description: 'Confidential support for LGBTQ individuals',
    url: 'https://www.lgbtqhotline.org',
  },
  {
    name: 'Crisis Text Line',
    text: 'Text HOME to 741741',
    phone: '',
    description: '24/7 text-based crisis support',
    url: 'https://www.crisistextline.org',
  },
];

export const crisisApi = {
  async logInterventionShown(storyId?: string): Promise<void> {
    await apiClient.post('/api/crisis/intervention-shown', { storyId });
  },

  async logResourceClicked(resourceName: string): Promise<void> {
    await apiClient.post('/api/crisis/resource-clicked', { resourceName });
  },
};