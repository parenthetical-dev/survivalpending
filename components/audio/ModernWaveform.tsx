'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ModernWaveformProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  progress: number;
  className?: string;
}

// Modern gradient inspired by progress flag
const createPrismaticGradient = (ctx: CanvasRenderingContext2D, width: number) => {
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  
  // Progress Pride flag colors in a smooth gradient
  gradient.addColorStop(0, '#E40303');      // Red
  gradient.addColorStop(0.14, '#FF8C00');   // Orange  
  gradient.addColorStop(0.28, '#FFED00');   // Yellow
  gradient.addColorStop(0.42, '#008026');   // Green
  gradient.addColorStop(0.56, '#24408E');   // Blue
  gradient.addColorStop(0.70, '#732982');   // Purple
  gradient.addColorStop(0.80, '#FFAFC8');   // Pink (trans)
  gradient.addColorStop(0.90, '#74D7EE');   // Light Blue (trans)
  gradient.addColorStop(1, '#613915');      // Brown
  
  return gradient;
};

export default function ModernWaveform({ 
  audioElement, 
  isPlaying, 
  progress,
  className 
}: ModernWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Smooth waveform data
  const waveformData = useRef<number[]>([]);
  const smoothingFactor = 0.6;
  
  useEffect(() => {
    if (!audioElement || isConnected) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    
    try {
      if (!(audioElement as any).audioSourceNode) {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 1024; // Balance between detail and performance
        analyserRef.current.smoothingTimeConstant = 0.3; // Much less smoothing for more movement
        analyserRef.current.minDecibels = -90;
        analyserRef.current.maxDecibels = -10;
        
        const source = audioContextRef.current.createMediaElementSource(audioElement);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        (audioElement as any).audioSourceNode = source;
        setIsConnected(true);
        
        // Resume audio context if suspended
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
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

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const draw = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      if (!analyserRef.current) {
        // If no analyser, draw static waveform
        drawStaticWaveform(ctx, canvas.offsetWidth, canvas.offsetHeight);
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(draw);
        }
        return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Debug: Check if we're getting audio data
      const maxValue = Math.max(...dataArray);
      if (maxValue === 0) {
        console.log('No audio data detected');
      }

      // Create smooth waveform path using fewer points for better performance
      const points = 150;
      const centerY = canvas.offsetHeight / 2;
      
      // Initialize waveform data if needed
      if (waveformData.current.length !== points) {
        waveformData.current = new Array(points).fill(0.2);
      }
      
      // Sample and smooth the frequency data
      for (let i = 0; i < points; i++) {
        // Sample multiple frequencies for better representation
        let sum = 0;
        const samplesPerPoint = 3;
        
        for (let j = 0; j < samplesPerPoint; j++) {
          // Focus on low to mid frequencies (voice range)
          const freqIndex = Math.floor((i / points) * bufferLength * 0.4) + j;
          if (freqIndex < bufferLength) {
            sum += dataArray[freqIndex];
          }
        }
        
        // Average and normalize
        const avgValue = (sum / samplesPerPoint) / 255.0;
        
        // Amplify the signal for better visibility
        const amplifiedValue = Math.pow(avgValue, 0.5) * 1.2;
        
        // Add minimum height for visibility
        const baseHeight = 0.05;
        const targetValue = baseHeight + amplifiedValue;
        
        // Smooth the transition with less smoothing for more responsiveness
        waveformData.current[i] = waveformData.current[i] * 0.3 + targetValue * 0.7;
      }

      // Create gradient
      const gradient = createPrismaticGradient(ctx, canvas.offsetWidth);

      // Draw upper waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      for (let i = 0; i < points; i++) {
        const x = (i / points) * canvas.offsetWidth;
        const nextX = ((i + 1) / points) * canvas.offsetWidth;
        const amplitude = waveformData.current[i] * canvas.offsetHeight * 0.45;
        const nextAmplitude = i < points - 1 ? waveformData.current[i + 1] * canvas.offsetHeight * 0.35 : amplitude;
        
        const cpX = (x + nextX) / 2;
        const cpY = centerY - (amplitude + nextAmplitude) / 2;
        
        ctx.quadraticCurveTo(x, centerY - amplitude, cpX, cpY);
      }
      
      ctx.lineTo(canvas.offsetWidth, centerY);
      ctx.closePath();
      
      // Apply gradient fill with transparency
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      
      // Draw mirrored lower waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      for (let i = 0; i < points; i++) {
        const x = (i / points) * canvas.offsetWidth;
        const nextX = ((i + 1) / points) * canvas.offsetWidth;
        const amplitude = waveformData.current[i] * canvas.offsetHeight * 0.45;
        const nextAmplitude = i < points - 1 ? waveformData.current[i + 1] * canvas.offsetHeight * 0.35 : amplitude;
        
        const cpX = (x + nextX) / 2;
        const cpY = centerY + (amplitude + nextAmplitude) / 2;
        
        ctx.quadraticCurveTo(x, centerY + amplitude, cpX, cpY);
      }
      
      ctx.lineTo(canvas.offsetWidth, centerY);
      ctx.closePath();
      
      ctx.globalAlpha = 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Draw progress overlay
      if (progress > 0) {
        const progressX = (canvas.offsetWidth * progress) / 100;
        
        // Subtle overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, progressX, canvas.offsetHeight);
        
        // Progress line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, canvas.offsetHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Resume audio context when playing
    if (isPlaying && audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    // Start animation
    if (isPlaying || !analyserRef.current) {
      draw();
    } else {
      drawStaticWaveform(ctx, canvas.offsetWidth, canvas.offsetHeight);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, progress, isConnected]);

  const drawStaticWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const centerY = height / 2;
    const gradient = createPrismaticGradient(ctx, width);
    
    // Draw smooth static wave
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    const points = 100;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const phase = (i / points) * Math.PI * 4;
      const amplitude = (Math.sin(phase) * 0.3 + Math.sin(phase * 2) * 0.1) * height * 0.3;
      
      if (i === 0) {
        ctx.lineTo(x, centerY - amplitude);
      } else {
        const prevX = ((i - 1) / points) * width;
        const prevPhase = ((i - 1) / points) * Math.PI * 4;
        const prevAmplitude = (Math.sin(prevPhase) * 0.3 + Math.sin(prevPhase * 2) * 0.1) * height * 0.3;
        const cpX = (prevX + x) / 2;
        const cpY = (centerY - prevAmplitude + centerY - amplitude) / 2;
        ctx.quadraticCurveTo(prevX, centerY - prevAmplitude, cpX, cpY);
      }
    }
    
    ctx.lineTo(width, centerY);
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.6;
    ctx.fill();
    
    // Mirror for lower half
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const phase = (i / points) * Math.PI * 4;
      const amplitude = (Math.sin(phase) * 0.3 + Math.sin(phase * 2) * 0.1) * height * 0.3;
      
      if (i === 0) {
        ctx.lineTo(x, centerY + amplitude);
      } else {
        const prevX = ((i - 1) / points) * width;
        const prevPhase = ((i - 1) / points) * Math.PI * 4;
        const prevAmplitude = (Math.sin(prevPhase) * 0.3 + Math.sin(prevPhase * 2) * 0.1) * height * 0.3;
        const cpX = (prevX + x) / 2;
        const cpY = (centerY + prevAmplitude + centerY + amplitude) / 2;
        ctx.quadraticCurveTo(prevX, centerY + prevAmplitude, cpX, cpY);
      }
    }
    
    ctx.lineTo(width, centerY);
    ctx.closePath();
    
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Progress overlay
    if (progress > 0) {
      const progressX = (width * progress) / 100;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, progressX, height);
    }
  };

  return (
    <div className={cn("relative w-full bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ height: '120px' }}
      />
    </div>
  );
}