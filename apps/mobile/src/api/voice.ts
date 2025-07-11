import { apiClient, retryWithBackoff } from '../config/api';
import * as FileSystem from 'expo-file-system';

export interface Voice {
  id: string;
  name: string;
  description: string;
  previewText: string;
}

// Map to actual ElevenLabs voice IDs matching the web app
export const AVAILABLE_VOICES: Voice[] = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Warm and friendly', previewText: 'Hello, I\'m Sarah.' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Emily', description: 'Calm and soothing', previewText: 'Hi there, I\'m Emily.' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Strong and confident', previewText: 'Hey, I\'m Josh.' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Wise and thoughtful', previewText: 'Greetings, I\'m Arnold.' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Bright and energetic', previewText: 'Hi! I\'m Adam.' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', description: 'Gentle and reflective', previewText: 'Hello, I\'m Sam.' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Bold and dynamic', previewText: 'Hey there, I\'m Domi.' },
  { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Bella', description: 'Comforting and secure', previewText: 'Hi, I\'m Bella.' },
];

export const voiceApi = {
  async previewVoice(voiceId: string, text?: string): Promise<string> {
    const response = await retryWithBackoff(() =>
      apiClient.post('/api/voice/preview', {
        voiceId,
        text: text || AVAILABLE_VOICES.find(v => v.id === voiceId)?.previewText,
      })
    );
    
    return response.data.audioUrl;
  },

  async generateAudio(voiceId: string, content: string): Promise<string> {
    try {
      const response = await retryWithBackoff(() =>
        apiClient.post('/api/voice/generate', {
          voiceId,
          text: content, // Changed from 'content' to 'text' to match web API
        }, {
          responseType: 'arraybuffer' // Expect audio data as response
        })
      );
      
      // If we get an audio buffer directly, save it and return local URL
      if (response.data instanceof ArrayBuffer) {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        const fileUri = `${FileSystem.documentDirectory}generated_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return fileUri;
      }
      
      // Otherwise expect a URL in the response
      return response.data.audioUrl;
    } catch (error) {
      console.error('Audio generation error:', error);
      throw error;
    }
  },

  async downloadAudio(audioUrl: string): Promise<string> {
    // Create a local file path for the audio
    const fileName = audioUrl.split('/').pop() || 'audio.mp3';
    const localUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Download the file
    const downloadResult = await FileSystem.downloadAsync(audioUrl, localUri);
    
    if (downloadResult.status !== 200) {
      throw new Error('Failed to download audio file');
    }
    
    return downloadResult.uri;
  },

  async clearAudioCache(): Promise<void> {
    const directory = FileSystem.documentDirectory;
    if (!directory) return;
    
    const files = await FileSystem.readDirectoryAsync(directory);
    const audioFiles = files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav'));
    
    await Promise.all(
      audioFiles.map(file => 
        FileSystem.deleteAsync(`${directory}${file}`, { idempotent: true })
      )
    );
  },
};