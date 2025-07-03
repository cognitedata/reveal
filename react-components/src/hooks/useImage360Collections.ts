import { createContext, useContext, useMemo } from 'react';
import { type DataSourceType, type Image360Collection } from '@cognite/reveal';
import { Image360CollectionDomainObject } from '../architecture/concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { useRevealDomainObjects } from './useRevealDomainObjects';
import { isDefined } from '../utilities/isDefined';

export type UseImage360CollectionsDependencies = {
  useRevealDomainObjects: typeof useRevealDomainObjects;
};

export const UseImage360CollectionsContext = createContext<UseImage360CollectionsDependencies>({
  useRevealDomainObjects
});

export const useImage360Collections = (): Array<Image360Collection<DataSourceType>> => {
  const { useRevealDomainObjects } = useContext(UseImage360CollectionsContext);

  const domainObjects = useRevealDomainObjects();

  return useMemo(
    () =>
      domainObjects
        .filter((domainObject) => domainObject instanceof Image360CollectionDomainObject)
        .map((domainObject) => domainObject.model)
        .filter(isDefined),
    [domainObjects]
  );
};
