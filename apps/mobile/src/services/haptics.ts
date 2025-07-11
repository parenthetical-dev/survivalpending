import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

class HapticsService {
  private isEnabled: boolean = true;

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  async trigger(type: HapticFeedbackType = 'light') {
    if (!this.isEnabled || Platform.OS === 'web') {
      return;
    }

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      // Silently fail if haptics are not available
      console.debug('Haptics not available:', error);
    }
  }

  // Convenience methods
  async light() {
    await this.trigger('light');
  }

  async medium() {
    await this.trigger('medium');
  }

  async heavy() {
    await this.trigger('heavy');
  }

  async success() {
    await this.trigger('success');
  }

  async warning() {
    await this.trigger('warning');
  }

  async error() {
    await this.trigger('error');
  }

  async selection() {
    await this.trigger('light');
  }

  // Custom patterns for specific use cases
  async quickExit() {
    // Triple heavy impact for quick exit
    for (let i = 0; i < 3; i++) {
      await this.heavy();
      await new Promise<void>(resolve => setTimeout(resolve, 100));
    }
  }

  async stageTransition() {
    // Light → Medium pattern for stage transitions
    await this.light();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    await this.medium();
  }

  async submission() {
    // Success pattern for story submission
    await this.medium();
    await new Promise<void>(resolve => setTimeout(resolve, 100));
    await this.success();
  }

  async crisisDetection() {
    // Custom pattern for crisis content detection
    await this.warning();
    await new Promise<void>(resolve => setTimeout(resolve, 200));
    await this.medium();
    await new Promise<void>(resolve => setTimeout(resolve, 200));
    await this.medium();
  }
}

export const haptics = new HapticsService();