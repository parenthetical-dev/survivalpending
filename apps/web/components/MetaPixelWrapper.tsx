import { Suspense } from 'react';
import { MetaPixel } from './MetaPixel';

interface MetaPixelWrapperProps {
  pixelId: string;
}

export function MetaPixelWrapper({ pixelId }: MetaPixelWrapperProps) {
  return (
    <Suspense fallback={null}>
      <MetaPixel pixelId={pixelId} />
    </Suspense>
  );
}