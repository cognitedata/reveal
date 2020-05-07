/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { toThreeJsBox3 } from '../views/threejs';
import { PotreeNodeWrapper } from '../views/threejs/pointcloud/PotreeNodeWrapper';
import { PotreeGroupWrapper } from '../views/threejs/pointcloud/PotreeGroupWrapper';
import { CogniteModelBase } from './CogniteModelBase';
import { SupportedModelTypes } from './types';

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

  getModelBoundingBox(): THREE.Box3 {
    return toThreeJsBox3(new THREE.Box3(), this.potreeNode.boundingBox);
  }

  get pointBudget(): number {
    return this.potreeNode.pointBudget;
  }

  set pointBudget(count: number) {
    this.potreeNode.pointBudget = count;
  }
}
