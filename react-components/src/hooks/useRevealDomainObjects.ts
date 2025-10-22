import { Context, createContext, useContext, useMemo } from 'react';
import { useRenderTarget } from '../components/RevealCanvas/ViewerContext';
import { useDisposableSignal } from '../utilities/signal/useDisposableSignal';
import { getRevealDomainUpdateSignal } from '../architecture/concrete/reveal/signal/getRevealDomainObjectsSignal';
import { type RevealDomainObject } from '../architecture/concrete/reveal/RevealDomainObject';
import { RevealRenderTarget } from '../architecture';

export type UseRevealDomainObjectsDependencies = {
  useRenderTarget: typeof useRenderTarget;
};

export const UseRevealDomainObjectsContext: Context<{
    useRenderTarget: () => RevealRenderTarget;
}> = createContext({
  useRenderTarget
});

export function useRevealDomainObjects(
  predicate?: (domainObject: RevealDomainObject) => boolean,
  additionalChangeFlags?: symbol[]
): RevealDomainObject[] {
  const { useRenderTarget } = useContext(UseRevealDomainObjectsContext);

  const renderTarget = useRenderTarget();

  const disposableSignal = useMemo(
    () => getRevealDomainUpdateSignal(renderTarget, predicate, additionalChangeFlags),
    [
      renderTarget,
      predicate,
      additionalChangeFlags?.map((changeFlag) => changeFlag.toString()).join(',')
    ]
  );

  return useDisposableSignal(disposableSignal);
}
