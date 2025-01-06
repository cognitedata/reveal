/*!
 * Copyright 2025 Cognite AS
 */
import { useRenderTarget } from '../components';

export function useIsCoreDmOnly(): boolean {
  return useRenderTarget().cdfCaches.coreDmOnly;
}
