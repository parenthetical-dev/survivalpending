import { sanityClient } from './sanity';

export interface FeaturedStory {
  _id: string;
  username: string;
  contentSanitized: string;
  audioUrl?: string;
  createdAt: string;
  voiceSettings?: {
    voiceName: string;
  };
}

export async function getHomepageFeaturedStories(): Promise<FeaturedStory[]> {
  try {
    const query = `*[_type == "story" && status == "approved" && showOnHomepage == true] | order(createdAt desc)[0...2] {
      _id,
      username,
      contentSanitized,
      audioUrl,
      createdAt,
      "voiceSettings": {
        "voiceName": voiceId
      }
    }`;

    const stories = await sanityClient.fetch(query);
    return stories || [];
  } catch (error) {
    console.error('Error fetching featured stories:', error);
    return [];
  }
}