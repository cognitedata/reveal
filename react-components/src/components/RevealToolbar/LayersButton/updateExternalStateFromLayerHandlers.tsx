import { type Dispatch, type SetStateAction } from 'react';
import { type LayersUrlStateParam, type ModelLayerHandlers } from './types';

export function updateExternalStateFromLayerHandlers(
  modelLayerHandlers: ModelLayerHandlers,
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined
): void {
  const newState = {
    cadLayers: modelLayerHandlers.cadHandlers.map((handler, index) => ({
      revisionId: handler.getRevisionId(),
      applied: handler.visible(),
      index
    })),
    pointCloudLayers: modelLayerHandlers.pointCloudHandlers.map((handler, index) => ({
      revisionId: handler.getRevisionId(),
      applied: handler.visible(),
      index
    })),
    image360Layers: modelLayerHandlers.image360Handlers.map((handler) => ({
      applied: handler.visible(),
      siteId: handler.getSiteId()
    }))
  };

  setExternalLayersState?.(newState);
}
