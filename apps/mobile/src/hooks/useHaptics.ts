import { useCallback } from 'react';
import { haptics } from '../services/haptics';

export function useHaptics() {
  const triggerHaptic = useCallback(
    (type: Parameters<typeof haptics.trigger>[0] = 'light') => {
      haptics.trigger(type);
    },
    []
  );

  return {
    trigger: triggerHaptic,
    light: haptics.light.bind(haptics),
    medium: haptics.medium.bind(haptics),
    heavy: haptics.heavy.bind(haptics),
    success: haptics.success.bind(haptics),
    warning: haptics.warning.bind(haptics),
    error: haptics.error.bind(haptics),
    selection: haptics.selection.bind(haptics),
    quickExit: haptics.quickExit.bind(haptics),
    stageTransition: haptics.stageTransition.bind(haptics),
    submission: haptics.submission.bind(haptics),
    crisisDetection: haptics.crisisDetection.bind(haptics),
  };
}