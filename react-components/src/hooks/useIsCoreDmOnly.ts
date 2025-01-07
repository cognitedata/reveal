/*!
 * Copyright 2025 Cognite AS
 */
import { useRenderTarget } from '../components';

export function useIsCoreDmOnly(): boolean {
  const renderTarget = useRenderTarget();
  const isCoreDmOnly = renderTarget.cdfCaches.coreDmOnly;
  return isCoreDmOnly ?? false;
}
