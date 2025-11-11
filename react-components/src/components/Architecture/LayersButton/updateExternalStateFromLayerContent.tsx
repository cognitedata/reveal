import { type Dispatch, type SetStateAction } from 'react';
import { type LayersUrlStateParam } from './types';
import { type ModelLayerContent } from './ModelLayerContent';

import { type RevealRenderTarget } from '../../../architecture';

export function updateExternalStateFromLayerContent(
  modelLayerContent: ModelLayerContent,
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  renderTarget: RevealRenderTarget
): void {
  const newState = {
    cadLayers: modelLayerContent.cadModels.map((model, index) => ({
      revisionId: model.model.revisionId,
      applied: model.isVisible(renderTarget),
      index
    })),
    pointCloudLayers: modelLayerContent.pointClouds.map((model, index) => ({
      revisionId: model.model.revisionId,
      applied: model.isVisible(renderTarget),
      index
    })),
    image360Layers: modelLayerContent.image360Collections.map((collection) => ({
      applied: collection.isVisible(renderTarget),
      siteId: collection.model.id
    }))
  };

  setExternalLayersState?.(newState);
}
