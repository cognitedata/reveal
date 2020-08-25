/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CogniteModelBase } from './CogniteModelBase';
import { toThreeJsBox3 } from '@/utilities';
import { PotreeNodeWrapper } from '@/datamodels/pointcloud/PotreeNodeWrapper';
import { PotreeGroupWrapper } from '@/datamodels/pointcloud/PotreeGroupWrapper';
import { PotreePointColorType } from '@/datamodels/pointcloud/types';
import { Matrix4 } from 'three';
import { SupportedModelTypes } from '../types';

/**
 * Documentation for the Cognite3DModel class
 * @noInheritDoc
 * @module @cognite/reveal
 */
export class CognitePointCloudModel extends THREE.Object3D implements CogniteModelBase {
  public readonly type: SupportedModelTypes = 'pointcloud';
  public readonly modelId: number;
  public readonly revisionId: number;
  private readonly potreeNode: PotreeNodeWrapper;

  /** @internal */
  constructor(modelId: number, revisionId: number, potreeGroup: PotreeGroupWrapper, potreeNode: PotreeNodeWrapper) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.potreeNode = potreeNode;
    this.add(potreeGroup);
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
    return toThreeJsBox3(outBbox || new THREE.Box3(), this.potreeNode.boundingBox);
  }

  /**
   * Apply transformation matrix to the model.
   * @param matrix Matrix to be applied.
   */
  updateTransformation(matrix: Matrix4): void {
    this.applyMatrix4(matrix);
    this.updateMatrixWorld(false);
  }

  get pointBudget(): number {
    return this.potreeNode.pointBudget;
  }

  /**
   * The point budget limits the number of points loaded and rendered at any given time,
   * which helps to adapt performance requirements to the capabilities of different hardware.
   */
  set pointBudget(count: number) {
    this.potreeNode.pointBudget = count;
  }

  get pointColorType(): PotreePointColorType {
    return this.potreeNode.pointColorType;
  }

  /**
   * @see {@link PotreePointColorType} for available types
   * @example
   * ```js
   * model.pointColorType = PotreePointColorType.Rgb
   * ```
   */
  set pointColorType(type: PotreePointColorType) {
    this.potreeNode.pointColorType = type;
  }
}
