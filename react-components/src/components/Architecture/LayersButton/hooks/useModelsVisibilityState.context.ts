import { createContext } from 'react';
import { useRevealDomainObjects, useVisibleRevealDomainObjects } from '../../../../hooks';

export type UseModelsVisibilityStateDependencies = {
  useRevealDomainObjects: typeof useRevealDomainObjects;
  useVisibleRevealDomainObjects: typeof useVisibleRevealDomainObjects;
};

export const defaultUseModelsVisibilityStateDependencies: UseModelsVisibilityStateDependencies = {
  useRevealDomainObjects,
  useVisibleRevealDomainObjects
};

export const UseModelsVisibilityStateContext = createContext<UseModelsVisibilityStateDependencies>(
  defaultUseModelsVisibilityStateDependencies
);
