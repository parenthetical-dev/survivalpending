import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { shakeDetection } from './shakeDetection';
import { haptics } from './haptics';
import { STORAGE_KEYS } from '../config/api';

class QuickExitService {
  private exitUrl: string = 'https://weather.com';
  private navigationRef: any = null;
  private tapCount: number = 0;
  private lastTapTime: number = 0;
  private tapTimeout: ReturnType<typeof setTimeout> | null = null;

  initialize(navigationRef: any) {
    this.navigationRef = navigationRef;
    this.startShakeDetection();
  }

  private startShakeDetection() {
    shakeDetection.start({
      shakesRequired: 3,
      timeWindow: 2000,
      onShake: () => this.performQuickExit('shake'),
    });
  }

  // Handle button taps for quick exit
  handleTap() {
    const now = Date.now();
    
    // Reset if too much time has passed since last tap
    if (now - this.lastTapTime > 1000) {
      this.tapCount = 0;
    }
    
    this.tapCount++;
    this.lastTapTime = now;
    
    // Clear existing timeout
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
    }
    
    // Provide haptic feedback
    haptics.medium();
    
    // Check if we've reached 3 taps
    if (this.tapCount >= 3) {
      this.performQuickExit('tap');
    } else {
      // Set timeout to reset tap count
      this.tapTimeout = setTimeout(() => {
        this.tapCount = 0;
      }, 1000);
    }
  }

  async performQuickExit(trigger: 'shake' | 'tap' | 'keyboard') {
    try {
      // Strong haptic feedback
      await haptics.quickExit();
      
      // Clear all sensitive data
      await this.clearAllData();
      
      // Navigate to weather site
      if (Platform.OS === 'web') {
        // On web, replace current page
        if (typeof window !== 'undefined') {
          (window as any).location.replace(this.exitUrl);
        }
      } else {
        // On mobile, open browser
        await Linking.openURL(this.exitUrl);
        
        // If navigation is available, reset to initial screen
        if (this.navigationRef?.current) {
          this.navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      }
      
      console.log(`Quick exit triggered via ${trigger}`);
    } catch (error) {
      console.error('Quick exit failed:', error);
      // Still try to open URL even if data clearing fails
      Linking.openURL(this.exitUrl).catch(() => {});
    }
  }

  private async clearAllData() {
    try {
      // Clear secure storage
      const keysToDelete = Object.values(STORAGE_KEYS);
      await Promise.all(
        keysToDelete.map(key => 
          SecureStore.deleteItemAsync(key).catch(() => {})
        )
      );
      
      // Clear AsyncStorage
      await AsyncStorage.clear();
      
      // Clear any in-memory data would go here
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  stop() {
    shakeDetection.stop();
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
      this.tapTimeout = null;
    }
    this.tapCount = 0;
  }
}

export const quickExit = new QuickExitService();