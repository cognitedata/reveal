import { createContext, useContext, useMemo } from 'react';
import { useRenderTarget } from '../components/RevealCanvas/ViewerContext';
import { useDisposableSignal } from '../utilities/signal/useDisposableSignal';
import { getRevealDomainUpdateSignal } from '../architecture/concrete/reveal/signal/getRevealDomainObjectsSignal';
import { type RevealDomainObject } from '../architecture/concrete/reveal/RevealDomainObject';
import { Changes, type DomainObject } from '../architecture';

export type UseVisibleRevealDomainObjectsDependencies = {
  useRenderTarget: typeof useRenderTarget;
};

export const UseVisibleRevealDomainObjectsContext = createContext({
  useRenderTarget
});

export function useVisibleRevealDomainObjects(): RevealDomainObject[] {
  const { useRenderTarget } = useContext(UseVisibleRevealDomainObjectsContext);

  const renderTarget = useRenderTarget();

  const disposableSignal = useMemo(() => {
    const predicate = (domainObject: DomainObject): boolean => domainObject.isVisible(renderTarget);
    const additionalChangeFlags = [Changes.visibleState];
    return getRevealDomainUpdateSignal(renderTarget, predicate, additionalChangeFlags);
  }, [renderTarget]);

  return useDisposableSignal(disposableSignal);
}
