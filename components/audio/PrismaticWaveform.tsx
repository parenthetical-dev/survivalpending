'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PrismaticWaveformProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  progress: number;
  className?: string;
}

// Progress Pride flag colors
const PROGRESS_COLORS = [
  '#E40303', // Red
  '#FF8C00', // Orange  
  '#FFED00', // Yellow
  '#008026', // Green
  '#24408E', // Blue
  '#732982', // Purple
  '#FFFFFF', // White
  '#FFAFC8', // Pink
  '#74D7EE', // Light Blue
  '#613915', // Brown
  '#000000', // Black
];

export default function PrismaticWaveform({ 
  audioElement, 
  isPlaying, 
  progress,
  className 
}: PrismaticWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [bars] = useState(100); // Number of bars for smooth waveform
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!audioElement || isConnected) return;

    // Create audio context and analyser
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    
    try {
      // Check if audio element already has a source
      if (!(audioElement as any).audioSourceNode) {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512; // Higher for better frequency resolution
        analyserRef.current.smoothingTimeConstant = 0.85; // Smoother transitions
        
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        // Mark the audio element to prevent re-connection
        (audioElement as any).audioSourceNode = sourceRef.current;
        setIsConnected(true);
      } else {
        // Reuse existing audio context
        const existingSource = (audioElement as any).audioSourceNode;
        audioContextRef.current = existingSource.context;
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        analyserRef.current.smoothingTimeConstant = 0.85;
        existingSource.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    } catch (error) {
      console.error('Audio context error:', error);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement, isConnected]);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const draw = () => {
      if (!analyserRef.current || !ctx) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Clear canvas completely
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const barWidth = Math.ceil(canvas.offsetWidth / bars);
      const barGap = 1;
      const centerY = canvas.offsetHeight / 2;

      for (let i = 0; i < bars; i++) {
        // Sample from the frequency data
        const dataIndex = Math.floor((i / bars) * bufferLength);
        const frequency = dataArray[dataIndex];
        
        // Calculate bar height
        const barHeight = Math.max(2, (frequency / 255) * canvas.offsetHeight * 0.9);
        
        // Calculate position
        const x = i * barWidth;
        
        // Get color from progress flag palette
        const colorIndex = Math.floor((i / bars) * PROGRESS_COLORS.length);
        const color = PROGRESS_COLORS[colorIndex];
        
        // Draw vertical line
        ctx.fillStyle = color;
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - barGap, barHeight);
      }

      // Draw progress indicator
      if (progress > 0) {
        const progressX = (canvas.offsetWidth * progress) / 100;
        
        // Progress line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, canvas.offsetHeight);
        ctx.stroke();
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (isPlaying) {
      draw();
    } else {
      // Draw static waveform when not playing
      drawStaticWaveform(ctx, canvas.offsetWidth, canvas.offsetHeight);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, progress, bars]);

  const drawStaticWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = Math.ceil(width / bars);
    const barGap = 1;
    const centerY = height / 2;

    for (let i = 0; i < bars; i++) {
      // Create smooth wave pattern
      const phase = (i / bars) * Math.PI * 4;
      const waveHeight = (Math.sin(phase) * 0.3 + 0.4) * height * 0.6;
      const barHeight = Math.max(2, waveHeight);
      
      const x = i * barWidth;
      
      // Get color from progress flag palette
      const colorIndex = Math.floor((i / bars) * PROGRESS_COLORS.length);
      const color = PROGRESS_COLORS[colorIndex];
      
      // Draw vertical line with slight opacity for static state
      ctx.fillStyle = color + 'CC'; // Add alpha for softer look
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - barGap, barHeight);
    }

    // Draw progress indicator
    if (progress > 0) {
      const progressX = (width * progress) / 100;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ height: '100px' }}
      />
    </div>
  );
}