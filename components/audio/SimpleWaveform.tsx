'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SimpleWaveformProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  progress: number;
  className?: string;
}

export default function SimpleWaveform({ 
  audioElement, 
  isPlaying, 
  progress,
  className 
}: SimpleWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!audioElement || isConnected) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    
    try {
      if (!(audioElement as any).audioSourceNode) {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        const source = audioContextRef.current.createMediaElementSource(audioElement);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        (audioElement as any).audioSourceNode = source;
        setIsConnected(true);
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
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const bars = 100;
      const barWidth = canvas.offsetWidth / bars;
      const centerY = canvas.offsetHeight / 2;

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        for (let i = 0; i < bars; i++) {
          const dataIndex = Math.floor((i / bars) * bufferLength * 0.5);
          const frequency = dataArray[dataIndex];
          const barHeight = Math.max(2, (frequency / 255) * canvas.offsetHeight * 0.8);
          
          const x = i * barWidth;
          
          // Simple gray color, darker for played portion
          if (i / bars <= progress) {
            ctx.fillStyle = '#333';
          } else {
            ctx.fillStyle = '#999';
          }
          
          ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
        }
      } else {
        // Static waveform when not playing
        for (let i = 0; i < bars; i++) {
          const x = i * barWidth;
          const phase = (i / bars) * Math.PI * 4;
          const barHeight = (Math.sin(phase) * 0.3 + 0.4) * canvas.offsetHeight * 0.6;
          
          if (i / bars <= progress) {
            ctx.fillStyle = '#333';
          } else {
            ctx.fillStyle = '#999';
          }
          
          ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
        }
      }

      // Progress line
      if (progress > 0) {
        const progressX = (canvas.offsetWidth * progress) / 100;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, canvas.offsetHeight);
        ctx.stroke();
      }

      if (isPlaying && audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, progress, isConnected]);

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