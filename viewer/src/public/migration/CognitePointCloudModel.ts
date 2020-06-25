/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CogniteModelBase } from './CogniteModelBase';
import { SupportedModelTypes } from './types';
import { toThreeJsBox3 } from '@/utilities';
import { PotreeNodeWrapper } from '@/datamodels/pointcloud/PotreeNodeWrapper';
import { PotreeGroupWrapper } from '@/datamodels/pointcloud/PotreeGroupWrapper';
import { PotreePointColorType } from '@/datamodels/pointcloud/types';
import { Matrix4 } from 'three';

export class CognitePointCloudModel extends THREE.Object3D implements CogniteModelBase {
  public readonly type: SupportedModelTypes = SupportedModelTypes.PointCloud;
  public readonly modelId: number;
  public readonly revisionId: number;
  private readonly potreeNode: PotreeNodeWrapper;

  constructor(modelId: number, revisionId: number, potreeGroup: PotreeGroupWrapper, potreeNode: PotreeNodeWrapper) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.potreeNode = potreeNode;
    this.add(potreeGroup);
  }

  dispose() {
    this.children = [];
  }

  getModelBoundingBox(outBbox?: THREE.Box3): THREE.Box3 {
    return toThreeJsBox3(outBbox || new THREE.Box3(), this.potreeNode.boundingBox);
  }

  updateTransformation(matrix: Matrix4): void {
    this.applyMatrix4(matrix);
    this.updateMatrixWorld(false);
  }

  get pointBudget(): number {
    return this.potreeNode.pointBudget;
  }

  set pointBudget(count: number) {
    this.potreeNode.pointBudget = count;
  }

  get pointColorType() {
    return this.potreeNode.pointColorType;
  }

  set pointColorType(type: PotreePointColorType) {
    this.potreeNode.pointColorType = type;
  }
}
