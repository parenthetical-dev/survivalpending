import { put, del } from '@vercel/blob';

/**
 * Vercel Blob Storage utilities for audio file management
 * 
 * Required environment variable:
 * - BLOB_READ_WRITE_TOKEN: Vercel Blob storage token
 * 
 * Note: In production, this token should be set in Vercel project settings
 */

export interface BlobUploadResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

export interface BlobUploadOptions {
  contentType?: string;
  addRandomSuffix?: boolean;
  cacheControlMaxAge?: number;
}

/**
 * Uploads an audio file to Vercel Blob storage
 * @param audioBuffer - The audio data as an ArrayBuffer
 * @param filename - The desired filename (will be prefixed with 'audio/')
 * @param options - Optional upload configuration
 * @returns Promise<BlobUploadResult> - The upload result containing the blob URL
 */
export async function uploadAudioToBlob(
  audioBuffer: ArrayBuffer,
  filename: string,
  options: BlobUploadOptions = {}
): Promise<BlobUploadResult> {
  const {
    contentType = 'audio/mpeg',
    addRandomSuffix = true,
    cacheControlMaxAge = 31536000, // 1 year
  } = options;

  // Check for required environment variable
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
  }

  // Ensure filename has proper extension
  const hasExtension = filename.includes('.');
  const finalFilename = hasExtension ? filename : `${filename}.mp3`;
  
  // Prefix with 'audio/' directory
  const pathname = `audio/${finalFilename}`;

  // Convert ArrayBuffer to Blob for upload
  const blob = new Blob([audioBuffer], { type: contentType });

  let attempt = 0;
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  while (attempt < maxRetries) {
    try {
      const result = await put(pathname, blob, {
        access: 'public',
        contentType,
        addRandomSuffix,
        cacheControlMaxAge,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return {
        url: result.url,
        downloadUrl: result.downloadUrl,
        pathname: result.pathname,
        contentType: result.contentType,
        contentDisposition: result.contentDisposition,
      };
    } catch (error) {
      attempt++;
      
      if (attempt === maxRetries) {
        console.error('Failed to upload audio to blob storage after max retries:', error);
        throw new Error(`Failed to upload audio file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.warn(`Upload attempt ${attempt} failed, retrying in ${retryDelay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  // This should never be reached due to the throw in the catch block
  throw new Error('Failed to upload audio file after all retries');
}

/**
 * Deletes an audio file from Vercel Blob storage
 * @param url - The blob URL to delete
 * @returns Promise<void>
 */
export async function deleteAudioFromBlob(url: string): Promise<void> {
  // Check for required environment variable
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
  }

  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error('Failed to delete audio from blob storage:', error);
    throw new Error(`Failed to delete audio file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a unique filename for audio storage
 * @param storyId - The story ID
 * @param userId - The user ID
 * @param voiceId - The voice ID used for generation
 * @returns string - A unique filename
 */
export function generateAudioFilename(
  storyId: string,
  userId: string,
  voiceId: string
): string {
  const timestamp = Date.now();
  const sanitizedStoryId = storyId.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedVoiceId = voiceId.replace(/[^a-zA-Z0-9-_]/g, '');
  
  return `${sanitizedStoryId}_${sanitizedUserId}_${sanitizedVoiceId}_${timestamp}`;
}

/**
 * Validates if an audio buffer is valid
 * @param audioBuffer - The audio buffer to validate
 * @returns boolean - True if valid, false otherwise
 */
export function isValidAudioBuffer(audioBuffer: ArrayBuffer): boolean {
  // Check if buffer exists and has content
  if (!audioBuffer || audioBuffer.byteLength === 0) {
    return false;
  }

  // Check for reasonable file size (max 10MB for 90-second audio)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (audioBuffer.byteLength > maxSize) {
    return false;
  }

  // Could add more validation here (e.g., check audio file headers)
  // For now, basic validation is sufficient
  
  return true;
}