/*!
 * Copyright 2022 Cognite AS
 */
import { AnnotationsAssetRef } from '@cognite/sdk';
import { CognitePointCloudModel } from './CognitePointCloudModel';
import type { Vector3 } from 'three';

export type PointCloudIntersection = {
  /**
   * The intersection type.
   */
  type: 'pointcloud';
  /**
   * The model that was intersected.
   */
  model: CognitePointCloudModel;
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
   */
  annotationId: number;
  /**
   * Reference to the asset associated to the intersected point cloud object, if any.
   */
  assetRef?: AnnotationsAssetRef;
};
