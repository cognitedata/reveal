import { type ModelLayerHandlers, type LayersUrlStateParam } from './types';
import { type RevealRenderTarget } from '../../../architecture';

export function updateViewerFromExternalState(
  layersState: LayersUrlStateParam | undefined,
  modelLayerHandlers: ModelLayerHandlers,
  renderTarget: RevealRenderTarget
): void {
  if (layersState === undefined) {
    return;
  }

  layersState.cadLayers?.forEach((layer) => {
    if (
      layer.index < modelLayerHandlers.cadHandlers.length &&
      modelLayerHandlers.cadHandlers[layer.index].model.revisionId === layer.revisionId
    ) {
      modelLayerHandlers.cadHandlers[layer.index].setVisibleInteractive(
        layer.applied,
        renderTarget
      );
    }
  });

  layersState.pointCloudLayers?.forEach((layer) => {
    if (
      layer.index < modelLayerHandlers.pointCloudHandlers.length &&
      modelLayerHandlers.pointCloudHandlers[layer.index].model.revisionId === layer.revisionId
    ) {
      modelLayerHandlers.pointCloudHandlers[layer.index].setVisibleInteractive(
        layer.applied,
        renderTarget
      );
    }
  });

  layersState.image360Layers?.forEach((layer) => {
    modelLayerHandlers.image360Handlers
      .find((collection) => collection.model.id === layer.siteId)
      ?.setVisibleInteractive(layer.applied, renderTarget);
  });
}
