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
      createExternalStateFromLayers(createModelLayersObject(domainObjects), renderTarget)
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

function createExternalStateFromLayers(
  models: ModelLayerContent,
  renderTarget: RevealRenderTarget
): LayersUrlStateParam {
  return {
    cadLayers: models.cadModels.map((cadModel, index) => ({
      applied: cadModel.isVisible(renderTarget),
      revisionId: cadModel.model.revisionId,
      index
    })),
    pointCloudLayers: models.pointClouds.map((pointCloud, index) => ({
      applied: pointCloud.isVisible(renderTarget),
      revisionId: pointCloud.model.revisionId,
      index
    })),
    image360Layers: models.image360Collections.map((image360Collection, index) => ({
      applied: image360Collection.isVisible(renderTarget),
      siteId: image360Collection.model.id,
      index
    }))
  };
}
