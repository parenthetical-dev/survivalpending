'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DynamicWaveformProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  progress: number;
  className?: string;
}

export default function DynamicWaveform({
  audioElement,
  isPlaying,
  progress,
  className,
}: DynamicWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isSetup, setIsSetup] = useState(false);

  // Number of bars
  const BARS = 80;
  const barData = useRef<number[]>(new Array(BARS).fill(0.1));

  // Setup audio context
  useEffect(() => {
    if (!audioElement || isSetup) return;

    const setupAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();

        // Create analyser
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;

        // Connect audio source
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        setIsSetup(true);

        // Resume context if needed
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      } catch (error) {
        console.error('Audio setup error:', error);
      }
    };

    setupAudio();
  }, [audioElement, isSetup]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateCanvasSize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const barWidth = canvas.offsetWidth / BARS;
      const centerY = canvas.offsetHeight / 2;

      if (isPlaying && analyserRef.current) {
        // Get frequency data
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Update bar data with frequency information
        for (let i = 0; i < BARS; i++) {
          // Sample from different parts of the frequency spectrum
          const freqIndex = Math.floor((i / BARS) * bufferLength * 0.5);
          const freqValue = dataArray[freqIndex] / 255;

          // Smooth transition
          const targetHeight = 0.1 + freqValue * 0.9;
          barData.current[i] += (targetHeight - barData.current[i]) * 0.3;
        }
      } else {
        // Static wave when not playing
        for (let i = 0; i < BARS; i++) {
          const wave = Math.sin((i / BARS) * Math.PI * 3) * 0.3 + 0.4;
          barData.current[i] += (wave - barData.current[i]) * 0.1;
        }
      }

      // Draw bars
      for (let i = 0; i < BARS; i++) {
        const x = i * barWidth;
        const barHeight = barData.current[i] * canvas.offsetHeight * 0.8;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, centerY - barHeight/2, 0, centerY + barHeight/2);

        // Progress Pride colors mapping
        const colors = [
          { r: 228, g: 3, b: 3 }, // Red
          { r: 255, g: 140, b: 0 }, // Orange
          { r: 255, g: 237, b: 0 }, // Yellow
          { r: 0, g: 128, b: 38 }, // Green
          { r: 36, g: 64, b: 142 }, // Blue
          { r: 115, g: 41, b: 130 }, // Purple
          { r: 255, g: 175, b: 200 }, // Pink
          { r: 116, g: 215, b: 238 }, // Light Blue
        ];

        const colorIndex = Math.floor((i / BARS) * colors.length);
        const color = colors[colorIndex] || colors[0];

        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, 0.7)`);
        gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
        gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, 0.7)`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        // Draw bar
        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - barHeight/2, barWidth - 1, barHeight);
      }

      // Draw progress
      if (progress > 0) {
        const progressX = (canvas.offsetWidth * progress) / 100;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, progressX, canvas.offsetHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, canvas.offsetHeight);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, progress, isSetup]);

  // Resume audio context on play
  useEffect(() => {
    if (isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [isPlaying]);

  return (
    <div className={cn('relative w-full bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ height: '100px' }}
      />
    </div>
  );
}