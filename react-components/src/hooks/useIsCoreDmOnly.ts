import { useRenderTarget } from '../components/RevealCanvas/ViewerContext';

export function useIsCoreDmOnly(): boolean {
  const renderTarget = useRenderTarget();
  return renderTarget.cdfCaches.coreDmOnly;
}
