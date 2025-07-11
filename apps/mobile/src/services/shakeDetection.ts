import { Accelerometer } from 'expo-sensors';
import { Subscription } from 'expo-sensors/src/Pedometer';
import { haptics } from './haptics';

interface ShakeDetectionOptions {
  threshold?: number;
  shakesRequired?: number;
  timeWindow?: number;
  onShake?: () => void;
}

class ShakeDetectionService {
  private subscription: Subscription | null = null;
  private lastShakeTime: number = 0;
  private shakeCount: number = 0;
  private options: Required<ShakeDetectionOptions> = {
    threshold: 2.0, // Acceleration threshold
    shakesRequired: 3,
    timeWindow: 2000, // 2 seconds to complete shakes
    onShake: () => {},
  };

  async start(options?: ShakeDetectionOptions) {
    if (this.subscription) {
      return; // Already running
    }

    // Merge options
    this.options = { ...this.options, ...options };

    try {
      // Check if accelerometer is available
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Accelerometer is not available on this device');
        return;
      }

      // Set update interval (in ms)
      Accelerometer.setUpdateInterval(100);

      // Subscribe to accelerometer updates
      this.subscription = Accelerometer.addListener((data: { x: number; y: number; z: number }) => {
        this.handleAccelerometerData(data);
      });
    } catch (error) {
      console.error('Failed to start shake detection:', error);
    }
  }

  stop() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.resetShakeCount();
  }

  private handleAccelerometerData(data: { x: number; y: number; z: number }) {
    // Calculate total acceleration
    const acceleration = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );

    // Check if acceleration exceeds threshold
    if (acceleration > this.options.threshold) {
      const now = Date.now();
      
      // Check if this shake is within the time window
      if (now - this.lastShakeTime > 300) { // Minimum 300ms between shakes
        if (now - this.lastShakeTime < this.options.timeWindow) {
          this.shakeCount++;
        } else {
          // Reset if too much time has passed
          this.shakeCount = 1;
        }
        
        this.lastShakeTime = now;
        
        // Trigger haptic feedback for each shake
        haptics.medium();
        
        // Check if we've reached the required number of shakes
        if (this.shakeCount >= this.options.shakesRequired) {
          this.triggerShakeAction();
        }
      }
    }
  }

  private triggerShakeAction() {
    // Reset shake count
    this.resetShakeCount();
    
    // Trigger heavy haptic feedback
    haptics.quickExit();
    
    // Call the callback
    this.options.onShake();
  }

  private resetShakeCount() {
    this.shakeCount = 0;
    this.lastShakeTime = 0;
  }

  isActive(): boolean {
    return this.subscription !== null;
  }
}

export const shakeDetection = new ShakeDetectionService();