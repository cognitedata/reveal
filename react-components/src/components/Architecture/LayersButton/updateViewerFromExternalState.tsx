import { type LayersUrlStateParam } from './types';
import { type ModelLayerContent } from './ModelLayerContent';
import { type RevealRenderTarget } from '../../../architecture';

export function updateViewerFromExternalState(
  layersState: LayersUrlStateParam | undefined,
  modelLayerContent: ModelLayerContent,
  renderTarget: RevealRenderTarget
): void {
  if (layersState === undefined) {
    return;
  }

  layersState.cadLayers?.forEach((layer) => {
    if (
      layer.index < modelLayerContent.cadModels.length &&
      modelLayerContent.cadModels[layer.index].model.revisionId === layer.revisionId
    ) {
      modelLayerContent.cadModels[layer.index].setVisibleInteractive(layer.applied, renderTarget);
    }
  });

  layersState.pointCloudLayers?.forEach((layer) => {
    if (
      layer.index < modelLayerContent.pointClouds.length &&
      modelLayerContent.pointClouds[layer.index].model.revisionId === layer.revisionId
    ) {
      modelLayerContent.pointClouds[layer.index].setVisibleInteractive(layer.applied, renderTarget);
    }
  });

  layersState.image360Layers?.forEach((layer) => {
    modelLayerContent.image360Collections
      .find((collection) => collection.model.id === layer.siteId)
      ?.setVisibleInteractive(layer.applied, renderTarget);
  });
}
