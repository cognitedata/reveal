/*!
 * Copyright 2024 Cognite AS
 */
import {
  type PointCloudIntersection,
  type AnyIntersection,
  type DMDataSourceType
} from '@cognite/reveal';

export const isPointCloudVolumeIntersection = (
  intersection: AnyIntersection | undefined
): intersection is PointCloudIntersection<DMDataSourceType> => {
  return (
    intersection?.type === 'pointcloud' &&
    intersection.volumeMetadata !== undefined &&
    'assetRef' in intersection.volumeMetadata &&
    'volumeInstanceRef' in intersection.volumeMetadata
  );
};
