'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { cn } from '@/lib/utils';

interface VoiceWaveformProps {
  audioUrl: string | null;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onTimeUpdate: (current: number, duration: number) => void;
  onEnd: () => void;
  className?: string;
}

export default function VoiceWaveform({
  audioUrl,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  onEnd,
  className,
}: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const howlRef = useRef<Howl | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Fetch and process audio data for static waveform
  const processAudioData = async (url: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      // Fetch and decode audio for waveform
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Process waveform data
      const rawData = audioBuffer.getChannelData(0);
      const samples = 300; // Number of samples to display
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];

      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      // Normalize
      const max = Math.max(...filteredData);
      const normalizedData = filteredData.map(n => n / max);

      setWaveformData(normalizedData);
      audioContext.close();
    } catch (error) {
      console.error('Audio processing error:', error);
    }
  };

  // Initialize Howler
  useEffect(() => {
    if (!audioUrl) return;

    setIsLoading(true);

    const sound = new Howl({
      src: [audioUrl],
      html5: true,
      format: ['mp3', 'webm'],
      onload: async () => {
        await processAudioData(audioUrl);
        setIsLoading(false);
      },
      onplay: () => {
        onPlayPause(true);
      },
      onpause: () => {
        onPlayPause(false);
      },
      onend: () => {
        onEnd();
      },
      onloaderror: (id, error) => {
        console.error('Load error:', error);
        setIsLoading(false);
      },
    });

    howlRef.current = sound;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      sound.unload();
    };
  }, [audioUrl]);

  // Handle play/pause
  useEffect(() => {
    const sound = howlRef.current;
    if (!sound || isLoading) return;

    if (isPlaying && !sound.playing()) {
      sound.play();
    } else if (!isPlaying && sound.playing()) {
      sound.pause();
    }
  }, [isPlaying, isLoading]);

  // Draw waveform
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const centerY = canvas.offsetHeight / 2;
      const sound = howlRef.current;
      const progress = sound ? (sound.seek()) / sound.duration() : 0;

      // Draw waveform
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;

      const barWidth = canvas.offsetWidth / waveformData.length;

      for (let i = 0; i < waveformData.length; i++) {
        const x = i * barWidth;
        const height = waveformData[i] * canvas.offsetHeight * 0.7;

        // Color based on progress
        if (i / waveformData.length <= progress) {
          // Gradient for played portion
          const gradient = ctx.createLinearGradient(x, centerY - height/2, x, centerY + height/2);
          gradient.addColorStop(0, '#E4030366'); // Red with transparency
          gradient.addColorStop(0.5, '#732982AA'); // Purple
          gradient.addColorStop(1, '#E4030366');
          ctx.strokeStyle = gradient;
        } else {
          ctx.strokeStyle = '#666';
        }

        ctx.beginPath();
        ctx.moveTo(x + barWidth/2, centerY - height / 2);
        ctx.lineTo(x + barWidth/2, centerY + height / 2);
        ctx.stroke();
      }

      // Draw progress line
      const progressX = progress * canvas.offsetWidth;
      ctx.strokeStyle = '#E40303';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, canvas.offsetHeight);
      ctx.stroke();

      // Update time
      if (sound && sound.playing()) {
        const seek = sound.seek();
        const duration = sound.duration();
        onTimeUpdate(seek, duration);
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    // Start animation if playing
    if (isPlaying) {
      const animate = () => {
        draw();
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveformData, isPlaying]);

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative w-full h-32 bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onClick={(e) => {
            const sound = howlRef.current;
            if (!sound || isLoading) return;

            const rect = canvasRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const progress = x / rect.width;
            sound.seek(progress * sound.duration());
          }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-sm text-muted-foreground">
              Analyzing voice data...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}