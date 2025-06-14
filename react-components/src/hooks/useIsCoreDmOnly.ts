import { useRenderTarget } from '../components/RevealCanvas/ViewerContext';

export function useIsCoreDmOnly(): boolean {
  const renderTarget = useRenderTarget();
  const isCoreDmOnly = renderTarget.cdfCaches.coreDmOnly;
  return isCoreDmOnly ?? false;
}
