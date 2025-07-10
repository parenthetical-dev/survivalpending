'use client';

import { useEffect } from 'react';
import { initializeAnalytics } from '@/lib/analytics';

export default function AnalyticsInitializer() {
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return null;
}