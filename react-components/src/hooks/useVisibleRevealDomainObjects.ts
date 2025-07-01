import { useMemo } from 'react';
import { useRenderTarget } from '../components/RevealCanvas/ViewerContext';
import { useRevealDomainObjects } from './useRevealDomainObjects';
import { Changes, type DomainObject } from '../architecture';
import type { RevealDomainObject } from '../architecture/concrete/reveal/RevealDomainObject';

export function useVisibleRevealDomainObjects(): RevealDomainObject[] {
  const renderTarget = useRenderTarget();

  const { predicate, additionalChangeFlags } = useMemo(() => {
    return {
      predicate: (domainObject: DomainObject) => domainObject.isVisible(renderTarget),
      additionalChangeFlags: [Changes.visibleState]
    };
  }, [renderTarget]);

  return useRevealDomainObjects(predicate, additionalChangeFlags);
}
