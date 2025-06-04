import { type DataSourceType, type Cognite3DViewer } from '@cognite/reveal';

export function getViewerResourceCount(viewer: Cognite3DViewer<DataSourceType>): number {
  return viewer.models.length + viewer.get360ImageCollections().length;
}
