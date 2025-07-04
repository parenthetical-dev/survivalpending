'use client';

import { useEffect, useRef, useState } from 'react';
import { useWavesurfer } from '@wavesurfer/react';
import { cn } from '@/lib/utils';

interface WaveSurferWaveformProps {
  audioUrl: string | null;
  isPlaying: boolean;
  onReady?: () => void;
  onFinish?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
}

export default function WaveSurferWaveform({
  audioUrl,
  isPlaying,
  onReady,
  onFinish,
  onTimeUpdate,
  onDurationChange,
  className
}: WaveSurferWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  
  const { wavesurfer, isPlaying: wsIsPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: audioUrl || undefined,
    waveColor: 'url(#gradient)',
    progressColor: 'url(#progress-gradient)',
    cursorColor: 'transparent',
    barWidth: 3,
    barRadius: 3,
    barGap: 2,
    height: 100,
    normalize: true,
    backend: 'WebAudio',
    interact: false,
  });

  // Handle play/pause
  useEffect(() => {
    if (!wavesurfer || !isReady) return;
    
    if (isPlaying && !wsIsPlaying) {
      wavesurfer.play();
    } else if (!isPlaying && wsIsPlaying) {
      wavesurfer.pause();
    }
  }, [isPlaying, wsIsPlaying, wavesurfer, isReady]);

  // Handle events
  useEffect(() => {
    if (!wavesurfer) return;

    const handleReady = () => {
      setIsReady(true);
      if (wavesurfer) {
        const duration = wavesurfer.getDuration();
        onDurationChange?.(duration);
      }
      onReady?.();
    };

    const handleFinish = () => {
      onFinish?.();
    };

    const handleTimeUpdate = (time: number) => {
      onTimeUpdate?.(time);
    };

    const unsubscribeReady = wavesurfer.on('ready', handleReady);
    const unsubscribeFinish = wavesurfer.on('finish', handleFinish);
    const unsubscribeTimeUpdate = wavesurfer.on('timeupdate', handleTimeUpdate);

    return () => {
      unsubscribeReady();
      unsubscribeFinish();
      unsubscribeTimeUpdate();
    };
  }, [wavesurfer, onReady, onFinish, onTimeUpdate, onDurationChange]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* SVG definitions for gradients */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E40303" stopOpacity="0.8" />
            <stop offset="12.5%" stopColor="#FF8C00" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#FFED00" stopOpacity="0.8" />
            <stop offset="37.5%" stopColor="#008026" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#24408E" stopOpacity="0.8" />
            <stop offset="62.5%" stopColor="#732982" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#FFAFC8" stopOpacity="0.8" />
            <stop offset="87.5%" stopColor="#74D7EE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#613915" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E40303" />
            <stop offset="12.5%" stopColor="#FF8C00" />
            <stop offset="25%" stopColor="#FFED00" />
            <stop offset="37.5%" stopColor="#008026" />
            <stop offset="50%" stopColor="#24408E" />
            <stop offset="62.5%" stopColor="#732982" />
            <stop offset="75%" stopColor="#FFAFC8" />
            <stop offset="87.5%" stopColor="#74D7EE" />
            <stop offset="100%" stopColor="#613915" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Waveform container */}
      <div 
        ref={containerRef} 
        className="w-full rounded-lg overflow-hidden bg-black/5 dark:bg-white/5"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
        }}
      />
      
      {/* Loading overlay */}
      {audioUrl && !isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg">
          <div className="animate-pulse text-sm text-muted-foreground">Loading waveform...</div>
        </div>
      )}
    </div>
  );
}