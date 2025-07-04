'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Howl } from 'howler';
import { cn } from '@/lib/utils';

interface ThreeWaveformProps {
  audioUrl: string | null;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onTimeUpdate: (current: number, duration: number) => void;
  onEnd: () => void;
  className?: string;
}

export default function ThreeWaveform({
  audioUrl,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  onEnd,
  className
}: ThreeWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);
  const howlRef = useRef<Howl | null>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Smoothing for bar heights
  const targetHeights = useRef<number[]>(new Array(32).fill(0));
  const currentHeights = useRef<number[]>(new Array(32).fill(0));
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 20, 100);
    sceneRef.current = scene;
    
    // Camera - MUCH closer for bigger bars
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 20, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);
    
    // Create bars - MUCH bigger size
    const barCount = 32; // Fewer bars for bigger size
    const barWidth = 0.4;
    const barSpacing = 0.5;
    const totalWidth = (barCount - 1) * barSpacing;
    
    const geometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
    
    for (let i = 0; i < barCount; i++) {
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x8B7FFF,
        transparent: true,
        opacity: 0.7,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x8B7FFF,
        emissiveIntensity: 0
      });
      
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = (i / (barCount - 1)) * totalWidth - totalWidth / 2;
      bar.position.y = 0;
      bar.castShadow = true;
      bar.receiveShadow = true;
      
      scene.add(bar);
      barsRef.current.push(bar);
    }
    
    // Handle resize
    const handleResize = () => {
      const width = containerRef.current?.clientWidth || 0;
      const height = containerRef.current?.clientHeight || 0;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);
  
  // Initialize Howler and audio context
  useEffect(() => {
    if (!audioUrl) return;
    
    const sound = new Howl({
      src: [audioUrl],
      html5: true,
      format: ['mp3', 'webm'],
      onload: () => {
        // Setup audio context for visualization
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContext();
          
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 128; // 64 frequency bins
          analyser.smoothingTimeConstant = 0.85;
          
          // Connect Howler to analyser using Howler's internal audio context
          if ((window as any).Howler.ctx && (sound as any)._sounds[0]) {
            const source = (window as any).Howler.ctx.createMediaElementSource(
              (sound as any)._sounds[0]._node
            );
            source.connect(analyser);
            analyser.connect((window as any).Howler.ctx.destination);
            analyserRef.current = analyser;
          }
        } catch (error) {
          console.error('Audio context setup error:', error);
        }
      },
      onplay: () => onPlayPause(true),
      onpause: () => onPlayPause(false),
      onend: () => onEnd()
    });
    
    howlRef.current = sound;
    
    return () => {
      sound.unload();
    };
  }, [audioUrl]);
  
  // Handle play/pause
  useEffect(() => {
    const sound = howlRef.current;
    if (!sound) return;
    
    if (isPlaying && !sound.playing()) {
      sound.play();
    } else if (!isPlaying && sound.playing()) {
      sound.pause();
    }
  }, [isPlaying]);
  
  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;
    
    const clock = new THREE.Clock();
    let frameCount = 0;
    
    const animate = () => {
      const time = clock.getElapsedTime();
      frameCount++;
      
      // Update audio time every 10 frames for performance
      if (frameCount % 10 === 0 && howlRef.current) {
        const seek = howlRef.current.seek() as number;
        const duration = howlRef.current.duration();
        onTimeUpdate(seek, duration);
      }
      
      // Get frequency data
      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Update target heights - increased amplitude
        for (let i = 0; i < barsRef.current.length; i++) {
          const dataIndex = Math.floor((i / barsRef.current.length) * bufferLength);
          targetHeights.current[i] = (dataArray[dataIndex] / 255) * 20 + 0.1;
        }
      } else {
        // Generate fake wave when not playing
        for (let i = 0; i < barsRef.current.length; i++) {
          targetHeights.current[i] = 
            (Math.sin(time * 2 + i * 0.2) * 0.5 + 0.5) * 5 + 0.1;
        }
      }
      
      // Update bars with smooth interpolation
      barsRef.current.forEach((bar, index) => {
        // Smooth height transition
        currentHeights.current[index] += 
          (targetHeights.current[index] - currentHeights.current[index]) * 0.15;
        
        const height = currentHeights.current[index];
        bar.scale.y = height;
        bar.position.y = height / 2;
        
        // Subtle rotation
        bar.rotation.y = time * 0.1;
        
        // Glow effect at peaks
        const material = bar.material as THREE.MeshPhysicalMaterial;
        material.emissiveIntensity = Math.min(height / 10, 0.5);
        
        // Color shift based on height
        const hue = 0.75 - (height / 10) * 0.15; // Purple to blue
        material.color.setHSL(hue, 0.5, 0.5);
        material.emissive.setHSL(hue, 0.5, 0.5);
      });
      
      // Render
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);
  
  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative w-full rounded-lg overflow-hidden",
        className
      )}
      onClick={(e) => {
        const sound = howlRef.current;
        if (!sound) return;
        
        const rect = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = x / rect.width;
        sound.seek(progress * sound.duration());
      }}
      style={{ cursor: 'pointer' }}
    />
  );
}