/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CogniteModelBase } from './CogniteModelBase';
import { PotreePointColorType, PotreePointShape } from '@/datamodels/pointcloud/types';
import { SupportedModelTypes } from '../types';
import { CameraConfiguration } from './types';
import { PointCloudNode } from '@/datamodels/pointcloud/PointCloudNode';

/**
 * Represents a point clouds model loaded from CDF.
 * @noInheritDoc
 * @module @cognite/reveal
 */
export class CognitePointCloudModel extends THREE.Object3D implements CogniteModelBase {
  public readonly type: SupportedModelTypes = 'pointcloud';
  public readonly modelId: number;
  /**
   * The modelId of the point cloud model in Cognite Data Fusion.
   */
  public readonly revisionId: number;
  /**
   * The revisionId of the specific model revision in Cognite Data Fusion.
   */
  private readonly pointCloudNode: PointCloudNode;

  /**
   * @param modelId
   * @param revisionId
   * @param pointCloudNode
   * @internal
   */
  constructor(modelId: number, revisionId: number, pointCloudNode: PointCloudNode) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.pointCloudNode = pointCloudNode;
    // this.matrixAutoUpdate = false;
    this.add(pointCloudNode);
  }

  /**
   * Used to clean up memory.
   */
  dispose() {
    this.children = [];
  }

  // eslint-disable-next-line jsdoc/require-description
  /**
   * @param outBbox Optional. Used to write result to.
   * @returns Model's bounding box.
   * @example
   * ```js
   * const box = new THREE.Box3()
   * model.getModelBoundingBox(box);
   * // box now has the bounding box
   *```
   * ```js
   * // the following code does the same
   * const box = model.getModelBoundingBox();
   * ```
   */
  getModelBoundingBox(outBbox?: THREE.Box3): THREE.Box3 {
    return this.pointCloudNode.getBoundingBox(outBbox);
  }

  /**
   * Retrieves the camera position and target stored for the model. Typically this
   * is used to store a good starting position for a model. Returns `undefined` if there
   * isn't any stored camera configuration for the model.
   */
  getCameraConfiguration(): CameraConfiguration | undefined {
    return this.pointCloudNode.cameraConfiguration;
  }

  /**
   * Sets transformation matrix of the model. This overrides the current transformation.
   * @version new in 1.1.0
   * @param transformationMatrix
   */
  setModelTransformation(transformationMatrix: THREE.Matrix4): void {
    this.pointCloudNode.setModelTransformation(transformationMatrix);
  }

  /**
   * Gets transformation matrix of the model.
   * @version new in 1.1.0
   * @param out Preallocated `THREE.Matrix4` (optional).
   */
  getModelTransformation(out?: THREE.Matrix4): THREE.Matrix4 {
    return this.pointCloudNode.getModelTransformation(out);
  }

  /**
   * Returns the current budget measured in number of points.
   */
  get pointBudget(): number {
    return this.pointCloudNode.pointBudget;
  }

  /**
   * The point budget limits the number of points loaded and rendered at any given time,
   * which helps to adapt performance requirements to the capabilities of different hardware.
   * Recommended values are between 500.000  and 10.000.000.
   */
  set pointBudget(count: number) {
    this.pointCloudNode.pointBudget = count;
  }

  /**
   * Determines how points currently are colored.
   */
  get pointColorType(): PotreePointColorType {
    return this.pointCloudNode.pointColorType;
  }

  /**
   * Specifies how points are colored.
   * @default PotreePointColorType.Rgb
   * @example
   * ```js
   * model.pointColorType = PotreePointColorType.Rgb
   * ```
   */
  set pointColorType(type: PotreePointColorType) {
    this.pointCloudNode.pointColorType = type;
  }

  /**
   * Returns the size of each rendered point in the point cloud.
   * @version New in 1.1.0
   */
  get pointSize(): number {
    return this.pointCloudNode.pointSize;
  }

  /**
   * Sets the size of each rendered point in the point cloud.
   * @default `1`
   * @version New in 1.1.0
   */
  set pointSize(size: number) {
    this.pointCloudNode.pointSize = size;
  }

  /**
   * Sets the point shape of eeach rendered point in the point cloud.
   * @default `PotreePointShape.Circle`
   * @see {@link PotreePointShape}.
   * @version New in 1.1.0
   */
  get pointShape(): PotreePointShape {
    return this.pointCloudNode.pointShape;
  }

  /**
   * Gets the point shape of each rendered point in the point cloud.
   * @see {@link PotreePointShape}.
   * @version New in 1.1.0
   */
  set pointShape(shape: PotreePointShape) {
    this.pointCloudNode.pointShape = shape;
  }
}
