import { type Dispatch, type SetStateAction, useContext, useEffect } from 'react';
import { type LayersUrlStateParam, type ModelLayerHandlers } from '../types';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject,
  RevealDomainObject,
  RevealRenderTarget
} from '../../../../architecture';
import { UseModelsVisibilityStateContext } from './useModelsVisibilityState.context';

export const useModelsVisibilityState = (
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  renderTarget: RevealRenderTarget
): ModelLayerHandlers => {
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

function createModelLayersObject(domainObjects: RevealDomainObject[]): ModelLayerHandlers {
  return {
    cadHandlers: domainObjects.filter((obj) => obj instanceof CadDomainObject),
    pointCloudHandlers: domainObjects.filter((obj) => obj instanceof PointCloudDomainObject),
    image360Handlers: domainObjects.filter((obj) => obj instanceof Image360CollectionDomainObject)
  };
}

function createExternalStateFromLayers(
  modelHandlers: ModelLayerHandlers,
  renderTarget: RevealRenderTarget
): LayersUrlStateParam {
  return {
    cadLayers: modelHandlers.cadHandlers.map((cadHandler, handlerIndex) => ({
      applied: cadHandler.isVisible(renderTarget),
      revisionId: cadHandler.model.revisionId,
      index: handlerIndex
    })),
    pointCloudLayers: modelHandlers.pointCloudHandlers.map((pointCloudHandler, handlerIndex) => ({
      applied: pointCloudHandler.isVisible(renderTarget),
      revisionId: pointCloudHandler.model.revisionId,
      index: handlerIndex
    })),
    image360Layers: modelHandlers.image360Handlers.map((image360Handler, handlerIndex) => ({
      applied: image360Handler.isVisible(renderTarget),
      siteId: image360Handler.model.id,
      index: handlerIndex
    }))
  };
}
