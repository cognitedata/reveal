import type { RevealRenderTarget } from '../../../../architecture';
import type { ModelLayerContent } from '../ModelLayerContent';
import type { LayersUrlStateParam } from '../types';

export function createExternalStateFromLayerContent(
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
