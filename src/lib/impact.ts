import { sampleImpact } from '@/mock/sample';
import type { Detection, ImpactView } from '@/types';

export function resolveImpact(_detection: Detection): ImpactView {
  return sampleImpact;
}
