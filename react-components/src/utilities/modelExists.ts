import {
  type CognitePointCloudModel,
  type Cognite3DViewer,
  type CogniteCadModel,
  type Image360Collection,
  type DataSourceType
} from '@cognite/reveal';

export function modelExists(
  model: CogniteCadModel | CognitePointCloudModel<DataSourceType> | undefined,
  viewer: Cognite3DViewer<DataSourceType>
): model is CogniteCadModel | CognitePointCloudModel<DataSourceType> {
  return model !== undefined && viewer.models.includes(model);
}

export function image360CollectionExists(
  image360Collection: Image360Collection<DataSourceType> | undefined,
  viewer: Cognite3DViewer<DataSourceType>
): image360Collection is Image360Collection<DataSourceType> {
  return (
    image360Collection !== undefined && viewer.get360ImageCollections().includes(image360Collection)
  );
}
