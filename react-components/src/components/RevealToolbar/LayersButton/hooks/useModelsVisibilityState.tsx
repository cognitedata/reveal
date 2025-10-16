import { type Dispatch, type SetStateAction, useContext, useEffect } from 'react';
import { type LayersUrlStateParam } from '../types';
import { type ModelLayerContent } from '../ModelLayerContent';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject,
  type RevealDomainObject,
  type RevealRenderTarget
} from '../../../../architecture';
import { UseModelsVisibilityStateContext } from './useModelsVisibilityState.context';
import { createExternalStateFromLayerContent } from './createExternalStateFromLayerContent';

export const useModelsVisibilityState = (
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  renderTarget: RevealRenderTarget
): ModelLayerContent => {
  const { useRevealDomainObjects, useVisibleRevealDomainObjects } = useContext(
    UseModelsVisibilityStateContext
  );

  const domainObjects = useRevealDomainObjects();
  const domainObjectsByVisibility = useVisibleRevealDomainObjects();

  useEffect(() => {
    setExternalLayersState?.(
      createExternalStateFromLayerContent(createModelLayersObject(domainObjects), renderTarget)
    );
  }, [domainObjectsByVisibility]);

  return createModelLayersObject(domainObjects);
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
