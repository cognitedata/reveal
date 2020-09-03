/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CogniteModelBase } from './CogniteModelBase';
import { PotreePointColorType } from '@/datamodels/pointcloud/types';
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
  public readonly revisionId: number;
  private readonly pointCloudNode: PointCloudNode;

  /** @internal */
  constructor(modelId: number, revisionId: number, pointCloudNode: PointCloudNode) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.pointCloudNode = pointCloudNode;
    this.add(pointCloudNode);
  }

  /**
   * Used to clean up memory.
   */
  dispose() {
    this.children = [];
  }

  /**
   * @param outBbox Optional. Used to write result to.
   * @returns model's bounding box.
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
   * Apply transformation matrix to the model.
   * @param matrix Matrix to be applied.
   */
  updateTransformation(matrix: THREE.Matrix4): void {
    this.applyMatrix4(matrix);
    this.updateMatrixWorld(false);
  }

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

  get pointColorType(): PotreePointColorType {
    return this.pointCloudNode.pointColorType;
  }

  /**
   * @see {@link PotreePointColorType} for available types
   * @example
   * ```js
   * model.pointColorType = PotreePointColorType.Rgb
   * ```
   */
  set pointColorType(type: PotreePointColorType) {
    this.pointCloudNode.pointColorType = type;
  }
}
