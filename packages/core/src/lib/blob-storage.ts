export async function uploadAudioToBlob(
  buffer: ArrayBuffer, 
  filename: string,
  options?: { contentType?: string; addRandomSuffix?: boolean }
): Promise<{ url: string }> {
  const suffix = options?.addRandomSuffix ? `-${Math.random().toString(36).substr(2, 9)}` : '';
  return { url: `https://example.com/${filename}${suffix}` };
}

export function generateAudioFilename(
  storyId: string,
  userId?: string,
  voiceId?: string
): string {
  const parts = ['audio', storyId];
  if (userId) parts.push(userId);
  if (voiceId) parts.push(voiceId);
  return `${parts.join('-')}-${Date.now()}.mp3`;
}