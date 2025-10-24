import { useContext, useMemo } from 'react';
import { type ModelLayerContent } from '../ModelLayerContent';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject,
  type RevealDomainObject
} from '../../../../architecture';
import { UseModelsVisibilityStateContext } from './useModelsVisibilityState.context';

export const useModelsVisibilityState = (): ModelLayerContent => {
  const { useRevealDomainObjects, useVisibleRevealDomainObjects } = useContext(
    UseModelsVisibilityStateContext
  );

  const domainObjects = useRevealDomainObjects();
  const domainObjectsByVisibility = useVisibleRevealDomainObjects();

  return useMemo(
    () => createModelLayersObject(domainObjects),
    [domainObjects, domainObjectsByVisibility]
  );
};

function createModelLayersObject(domainObjects: RevealDomainObject[]): ModelLayerContent {
  return {
    cadModels: domainObjects.filter((obj) => obj instanceof CadDomainObject),
    pointClouds: domainObjects.filter((obj) => obj instanceof PointCloudDomainObject),
    image360Collections: domainObjects.filter(
      (obj) => obj instanceof Image360CollectionDomainObject
    )
  };
}
