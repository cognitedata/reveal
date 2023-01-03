/*!
 * Copyright 2022 Cognite AS
 */
import { AnnotationsAssetRef } from '@cognite/sdk';
import { CognitePointCloudModel } from './CognitePointCloudModel';

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
   * Tree index of the intersected 3D node.
   */
  point: THREE.Vector3;
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
   * Asset Id of the intersected object within a pointcloud, if any.
   */
  assetRef?: AnnotationsAssetRef;
};
