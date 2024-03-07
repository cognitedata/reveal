import { Dispatch, SetStateAction } from 'react';
import { LayersUrlStateParam } from '../../../hooks/types';
import { ModelLayerHandlers } from './LayersButtonsStrip';

export function updateExternalStateFromLayerHandlers(
  modelLayerHandlers: ModelLayerHandlers,
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam>>
) {
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

  setExternalLayersState(newState);
}
