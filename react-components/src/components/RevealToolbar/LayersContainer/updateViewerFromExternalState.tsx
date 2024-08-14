/*!
 * Copyright 2024 Cognite AS
 */
import {
  type Cognite3DViewer,
  type CogniteCadModel,
  type CognitePointCloudModel
} from '@cognite/reveal';
import { type LayersUrlStateParam } from '../../../hooks/types';

export function updateViewerFromExternalState(
  layersState: LayersUrlStateParam | undefined,
  viewer: Cognite3DViewer
): void {
  if (layersState === undefined) {
    return;
  }

  const cadModels = viewer.models.filter((model): model is CogniteCadModel => model.type === 'cad');
  const pointCloudModels = viewer.models.filter(
    (model): model is CognitePointCloudModel => model.type === 'pointcloud'
  );
  const image360Collections = viewer.get360ImageCollections();

  layersState.cadLayers?.forEach((layer) => {
    if (layer.index < cadModels.length && cadModels[layer.index].revisionId === layer.revisionId) {
      cadModels[layer.index].visible = layer.applied;
    }
  });

  layersState.pointCloudLayers?.forEach((layer) => {
    if (
      layer.index < pointCloudModels.length &&
      pointCloudModels[layer.index].revisionId === layer.revisionId
    ) {
      pointCloudModels[layer.index].visible = layer.applied;
    }
  });

  layersState.image360Layers?.forEach((layer) => {
    image360Collections
      .find((collection) => collection.id === layer.siteId)
      ?.setIconsVisibility(layer.applied);
  });
}
