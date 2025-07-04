'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { cn } from '@/lib/utils';

interface HowlerWaveformProps {
  audioUrl: string | null;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onTimeUpdate: (current: number, duration: number) => void;
  onEnd: () => void;
  className?: string;
}

export default function HowlerWaveform({
  audioUrl,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  onEnd,
  className
}: HowlerWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const howlRef = useRef<Howl | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [bars] = useState(100);
  const [waveformData] = useState(() => {
    // Generate static waveform data
    const data = [];
    for (let i = 0; i < bars; i++) {
      const t = i / bars;
      // Create a realistic waveform pattern
      const height = 
        Math.sin(t * Math.PI * 4) * 0.3 +
        Math.sin(t * Math.PI * 8) * 0.2 +
        Math.sin(t * Math.PI * 16) * 0.1 +
        Math.random() * 0.2 +
        0.3;
      data.push(Math.max(0.1, Math.min(1, height)));
    }
    return data;
  });

  // Initialize Howler
  useEffect(() => {
    if (!audioUrl) return;

    setIsLoading(true);
    
    const sound = new Howl({
      src: [audioUrl],
      html5: true,
      format: ['mp3', 'webm'],
      onload: () => {
        setIsLoading(false);
      },
      onplay: () => {
        onPlayPause(true);
        startAnimation();
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
      }
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

  // Animation loop for time updates
  const startAnimation = () => {
    const animate = () => {
      const sound = howlRef.current;
      if (sound && sound.playing()) {
        const seek = sound.seek() as number;
        const duration = sound.duration();
        onTimeUpdate(seek, duration);
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  // Draw waveform
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      const barWidth = canvas.offsetWidth / bars;
      const centerY = canvas.offsetHeight / 2;
      
      // Progress Pride colors
      const colors = [
        '#E40303', // Red
        '#FF8C00', // Orange
        '#FFED00', // Yellow
        '#008026', // Green
        '#24408E', // Blue
        '#732982', // Purple
        '#FFAFC8', // Pink
        '#74D7EE', // Light Blue
        '#613915', // Brown
      ];
      
      // Get current progress
      const sound = howlRef.current;
      const progress = sound ? (sound.seek() as number) / sound.duration() : 0;
      
      // Draw bars
      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const barHeight = waveformData[i] * canvas.offsetHeight * 0.7;
        const isPlayed = i / bars <= progress;
        
        // Color based on position in the waveform
        const colorIndex = Math.floor((i / bars) * colors.length);
        const color = colors[colorIndex];
        
        // Draw bar
        ctx.fillStyle = isPlayed ? color : color + '44';
        ctx.fillRect(
          x + barWidth * 0.2,
          centerY - barHeight / 2,
          barWidth * 0.6,
          barHeight
        );
      }
    };

    // Initial draw
    draw();

    // Redraw on animation frame if playing
    let frameId: number;
    const animate = () => {
      draw();
      if (isPlaying) {
        frameId = requestAnimationFrame(animate);
      }
    };
    
    if (isPlaying) {
      animate();
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isPlaying, bars, waveformData]);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative w-full h-24 bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onClick={(e) => {
            // Seek on click
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
              Loading audio...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}