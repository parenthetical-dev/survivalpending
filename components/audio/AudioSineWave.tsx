'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioSineWaveProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  progress: number;
  className?: string;
}

export default function AudioSineWave({ 
  audioElement, 
  isPlaying, 
  progress,
  className 
}: AudioSineWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  
  // Wave configuration
  const waveConfig = {
    amplitude: 30,
    frequency: 0.02,
    speed: 0.15,
    waves: 3,
  };
  
  // Setup audio context
  useEffect(() => {
    if (!audioElement || isSetup) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setIsSetup(true);
      
      // Resume context if needed
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (error) {
      console.error('Audio setup error:', error);
    }
  }, [audioElement, isSetup]);
  
  // Resume audio context when playing
  useEffect(() => {
    if (isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [isPlaying]);
  
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
    
    let phase = 0;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      const centerY = canvas.offsetHeight / 2;
      const width = canvas.offsetWidth;
      
      // Get audio data for amplitude modulation
      let audioAmplitude = 1;
      if (isPlaying && analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average amplitude from lower frequencies
        let sum = 0;
        const count = Math.floor(bufferLength * 0.5);
        for (let i = 0; i < count; i++) {
          sum += dataArray[i];
        }
        audioAmplitude = (sum / count / 255) * 2 + 0.5;
      }
      
      // Progress Pride flag colors
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
      
      // Draw multiple sine waves
      for (let waveIndex = 0; waveIndex < waveConfig.waves; waveIndex++) {
        const waveOffset = (waveIndex / waveConfig.waves) * Math.PI * 2;
        const colorIndex = waveIndex % colors.length;
        
        ctx.beginPath();
        ctx.strokeStyle = colors[colorIndex] + (waveIndex === 0 ? 'FF' : '88');
        ctx.lineWidth = 3 - waveIndex * 0.5;
        
        // Draw sine wave
        for (let x = 0; x <= width; x++) {
          const relativeX = x / width;
          
          // Calculate y position with multiple sine waves
          const y = centerY + 
            Math.sin((relativeX * Math.PI * 4) + phase + waveOffset) * 
            waveConfig.amplitude * audioAmplitude * (1 - waveIndex * 0.2) +
            Math.sin((relativeX * Math.PI * 8) + phase * 2 + waveOffset) * 
            waveConfig.amplitude * 0.3 * audioAmplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
      
      // Draw progress indicator
      if (progress > 0) {
        const progressX = (width * progress) / 100;
        
        // Glow effect
        const gradient = ctx.createLinearGradient(progressX - 20, 0, progressX + 20, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(progressX - 20, 0, 40, canvas.offsetHeight);
        
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
      
      // Update phase for animation
      if (isPlaying) {
        phase += waveConfig.speed;
      } else {
        phase += waveConfig.speed * 0.2; // Slower when not playing
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
  
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg bg-black/5 dark:bg-white/5", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ height: '120px' }}
      />
    </div>
  );
}