'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PlyrPlayerProps {
  audioUrl: string | null;
  onEnd?: () => void;
  className?: string;
}

export default function PlyrPlayer({ audioUrl, onEnd, className }: PlyrPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plyrRef = useRef<any>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Process audio to get waveform data
  useEffect(() => {
    if (!audioUrl) return;

    const processAudio = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Get audio data
        const rawData = audioBuffer.getChannelData(0);
        const samples = 200;
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
        const normalized = filteredData.map(n => n / max);
        setWaveformData(normalized);
        
        audioContext.close();
      } catch (error) {
        console.error('Audio processing error:', error);
      }
    };

    processAudio();
  }, [audioUrl]);

  // Initialize Plyr
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const initPlyr = async () => {
      const Plyr = (await import('plyr')).default;
      await import('plyr/dist/plyr.css');
      await import('@/styles/plyr-custom.css');
      
      plyrRef.current = new Plyr(audioRef.current, {
        controls: ['play', 'progress', 'current-time', 'duration', 'volume'],
        settings: [],
        keyboard: { focused: true, global: false }
      });
      
      // Force transparent background
      const plyrElement = audioRef.current?.closest('.plyr');
      if (plyrElement) {
        (plyrElement as HTMLElement).style.background = 'transparent';
        const controls = plyrElement.querySelector('.plyr__controls');
        if (controls) {
          (controls as HTMLElement).style.background = 'transparent';
        }
      }

      if (onEnd) {
        plyrRef.current.on('ended', onEnd);
      }
    };

    initPlyr();

    return () => {
      plyrRef.current?.destroy();
    };
  }, [audioUrl, onEnd]);

  // Draw static waveform
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Draw waveform
    const barWidth = canvas.offsetWidth / waveformData.length;
    const centerY = canvas.offsetHeight / 2;

    ctx.fillStyle = '#666';

    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth;
      const barHeight = waveformData[i] * canvas.offsetHeight * 0.8;
      
      ctx.fillRect(
        x + barWidth * 0.2,
        centerY - barHeight / 2,
        barWidth * 0.6,
        barHeight
      );
    }
  }, [waveformData]);

  if (!audioUrl) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
          <p className="text-center text-muted-foreground">No audio URL provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Plyr Audio Player with gray background */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          controls
          className="w-full"
        />
      </div>
      
      {/* Static Waveform Visualization */}
      {waveformData.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-20"
          />
        </div>
      )}
    </div>
  );
}