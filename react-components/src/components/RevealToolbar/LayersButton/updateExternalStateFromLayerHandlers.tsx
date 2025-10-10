import { type Dispatch, type SetStateAction } from 'react';
import { type LayersUrlStateParam, type ModelLayerHandlers } from './types';
import { RevealRenderTarget } from '../../../architecture';

export function updateExternalStateFromLayerHandlers(
  modelLayerHandlers: ModelLayerHandlers,
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  renderTarget: RevealRenderTarget
): void {
  const newState = {
    cadLayers: modelLayerHandlers.cadHandlers.map((handler, index) => ({
      revisionId: handler.model.revisionId,
      applied: handler.isVisible(renderTarget),
      index
    })),
    pointCloudLayers: modelLayerHandlers.pointCloudHandlers.map((handler, index) => ({
      revisionId: handler.model.revisionId,
      applied: handler.isVisible(renderTarget),
      index
    })),
    image360Layers: modelLayerHandlers.image360Handlers.map((handler) => ({
      applied: handler.isVisible(renderTarget),
      siteId: handler.model.id
    }))
  };

  setExternalLayersState?.(newState);
}
