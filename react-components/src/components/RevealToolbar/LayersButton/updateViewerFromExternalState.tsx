import {
  type DataSourceType,
  type Cognite3DViewer,
  type CogniteCadModel,
  type CognitePointCloudModel
} from '@cognite/reveal';
import { ModelLayerHandlers, type LayersUrlStateParam } from './types';
import { RevealRenderTarget } from '../../../architecture';

export function updateViewerFromExternalState(
  layersState: LayersUrlStateParam | undefined,
  modelLayerHandlers: ModelLayerHandlers,
  renderTarget: RevealRenderTarget
): void {
  if (layersState === undefined) {
    return;
  }

  // const cadModels = viewer.models.filter((model): model is CogniteCadModel => model.type === 'cad');
  /* const pointCloudModels = viewer.models.filter(
    (model): model is CognitePointCloudModel<DataSourceType> => model.type === 'pointcloud'
  );
  const image360Collections = viewer.get360ImageCollections(); */

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
