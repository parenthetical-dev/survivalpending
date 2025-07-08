import { generateVoiceAudio, generateVoicePreview } from '@/lib/voice-generation';
import { setupCommonMocks, cleanupMocks } from '@/tests/fixtures/test-helpers';

// Mock fetch
global.fetch = jest.fn();

describe('Voice Generation', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('generateVoicePreview', () => {
    it('validates voice ID before making request', async () => {
      const result = await generateVoicePreview('invalid-voice-id');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid voice ID');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('generates preview for valid voice', async () => {
      const mockAudioBuffer = Buffer.from('mock-audio-data');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockAudioBuffer,
      });

      const result = await generateVoicePreview('EXAVITQu4vr4xnSDxMaL'); // Sarah
      
      expect(result.success).toBe(true);
      expect(result.audioBuffer).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'xi-api-key': 'test-elevenlabs-key',
          }),
        })
      );
    });

    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await generateVoicePreview('EXAVITQu4vr4xnSDxMaL');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Voice generation failed');
    });
  });

  describe('generateVoiceAudio', () => {
    it('validates voice ID', async () => {
      const result = await generateVoiceAudio(
        'Test story',
        'invalid-voice',
        'user-123'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid voice ID');
    });

    it('truncates long text to 1000 characters', async () => {
      const longText = 'a'.repeat(1500);
      const mockAudioBuffer = Buffer.from('mock-audio-data');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockAudioBuffer,
      });

      await generateVoiceAudio(longText, 'EXAVITQu4vr4xnSDxMaL', 'user-123');
      
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody.text.length).toBe(1000);
    });

    it('uses correct voice settings', async () => {
      const mockAudioBuffer = Buffer.from('mock-audio-data');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockAudioBuffer,
      });

      await generateVoiceAudio(
        'Test story',
        'EXAVITQu4vr4xnSDxMaL',
        'user-123'
      );
      
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody).toMatchObject({
        text: 'Test story',
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.85,
          style: 0.4,
          use_speaker_boost: true,
        },
      });
    });

    it('returns dummy audio in development when no API key', async () => {
      process.env.ELEVENLABS_API_KEY = '';
      process.env.NODE_ENV = 'development';
      
      const result = await generateVoiceAudio(
        'Test story',
        'EXAVITQu4vr4xnSDxMaL',
        'user-123'
      );
      
      expect(result.success).toBe(true);
      expect(result.audioUrl).toContain('dummy-audio');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});