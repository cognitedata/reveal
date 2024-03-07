import { Cognite3DViewer, CogniteCadModel, CognitePointCloudModel } from '@cognite/reveal';
import { LayersUrlStateParam } from '../../../hooks/types';

export function updateViewerFromExternalState({
  layersState,
  viewer
}: {
  layersState: LayersUrlStateParam;
  viewer: Cognite3DViewer;
}): void {
  const cadModels = viewer.models.filter((model): model is CogniteCadModel => model.type === 'cad');
  const pointCloudModels = viewer.models.filter(
    (model): model is CognitePointCloudModel => model.type === 'pointcloud'
  );
  const image360Collections = viewer.get360ImageCollections();

  layersState.cadLayers?.forEach((layer) => {
    if (cadModels[layer.index].revisionId === layer.revisionId) {
      cadModels[layer.index].visible = layer.applied;
    }
  });

  layersState.pointCloudLayers?.forEach((layer) => {
    if (pointCloudModels[layer.index].revisionId === layer.revisionId) {
      pointCloudModels[layer.index].visible = layer.applied;
    }
  });

  layersState.image360Layers?.forEach((layer) => {
    image360Collections
      .find((collection) => collection.id === layer.siteId)
      ?.setIconsVisibility(layer.applied);
  });
}
