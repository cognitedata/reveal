/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CognitePointCloudModel,
  type Cognite3DViewer,
  type CogniteCadModel,
  type Image360Collection
} from '@cognite/reveal';

export function modelExists(
  model: CogniteCadModel | CognitePointCloudModel | undefined,
  viewer: Cognite3DViewer
): model is CogniteCadModel | CognitePointCloudModel {
  return model !== undefined && viewer.models.includes(model);
}

export function image360CollectionExists(
  image360Collection: Image360Collection | undefined,
  viewer: Cognite3DViewer
): image360Collection is Image360Collection {
  return (
    image360Collection !== undefined && viewer.get360ImageCollections().includes(image360Collection)
  );
}
