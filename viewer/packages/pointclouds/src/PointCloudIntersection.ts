/*!
 * Copyright 2022 Cognite AS
 */
import { AnnotationsAssetRef } from '@cognite/sdk';
import { CognitePointCloudModel } from './CognitePointCloudModel';
import type { Vector3 } from 'three';
import { DataSourceType } from '@reveal/data-providers';

export type PointCloudIntersection<T extends DataSourceType> = {
  /**
   * The intersection type.
   */
  type: 'pointcloud';
  /**
   * The model that was intersected.
   */
  model: CognitePointCloudModel<T>;
  /**
   * Coordinate of the intersection.
   */
  point: Vector3;
  /**
   * The index of the point that was intersected.
   */
  pointIndex: number;
  /**
   * Distance from the camera to the intersection.
   */
  distanceToCamera: number;
  /**
   * Annotation Id of the intersected object within a pointcloud. (0 if not applicable)
   * @deprecated Use `volumeMetadata` instead
   */
  annotationId: number;
  /**
   * Reference to the asset associated to the intersected point cloud object, if any.
   * @deprecated use `volumeMetadat` instead
   */
  assetRef?: AnnotationsAssetRef;
  /**
   * Point cloud volume reference associated with the intersected point cloud volume, if any.
   */
  volumeMetadata?: T['pointCloudVolumeMetadata'];
};
