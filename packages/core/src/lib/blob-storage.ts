export async function uploadAudioToBlob(buffer: ArrayBuffer, filename: string): Promise<{ url: string }> {
  return { url: `https://example.com/${filename}` };
}

export function generateAudioFilename(voiceId: string): string {
  return `audio-${voiceId}-${Date.now()}.mp3`;
}