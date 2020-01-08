/*!
 * Copyright 2019 Cognite AS
 */

// @ts-ignore
import * as Potree from '@cognite/potree-core';
import { PotreePointSizeType, PotreePointColorType, PotreePointShape } from './enums';
import { fromThreeJsBox3 } from '../utilities';
import { Box3 } from '../../../utils/Box3';

/**
 * Wrapper around `Potree.PointCloudOctree` with some convinence functions.
 */
export class PotreeNodeWrapper {
  readonly octtree: Potree.PointCloudOctreeNode;

  constructor(octtree: Potree.PointCloudOctreeNode) {
    this.octtree = octtree;
    this.pointSize = 2;
    this.pointSizeType = PotreePointSizeType.Adaptive;
    this.pointColorType = PotreePointColorType.Rgb;
    this.pointShape = PotreePointShape.Circle;

    this.pointBudget = 2_000_000;
  }

  get pointSize(): number {
    return this.octtree.material.size;
  }
  set pointSize(size: number) {
    this.octtree.material.size = size;
  }

  get pointSizeType(): PotreePointSizeType {
    return this.octtree.material.pointSizeType;
  }
  set pointSizeType(type: PotreePointSizeType) {
    this.octtree.material.pointSizeType = type;
  }

  get pointBudget(): number {
    return this.octtree.pointBudget;
  }
  set pointBudget(count: number) {
    // this.octtree.visiblePointsTarget = count;
    this.octtree.pointBudget = count;
  }
  get visiblePointCount(): number {
    return this.octtree.numVisiblePoints || 0;
  }

  get boundingBox(): Box3 {
    // const offset: THREE.Vector3 = this.octtree.position;
    const bbox: THREE.Box3 = this.octtree.boundingBox;
    // bbox.translate(offset.negate());
    return fromThreeJsBox3(bbox);
  }

  get pointColorType(): PotreePointColorType {
    return this.octtree.material.pointColorType;
  }
  set pointColorType(type: PotreePointColorType) {
    this.octtree.material.pointColorType = type;
  }

  get pointShape(): PotreePointShape {
    return this.octtree.material.shape;
  }
  set pointShape(shape: PotreePointShape) {
    this.octtree.material.shape = shape;
  }
}
