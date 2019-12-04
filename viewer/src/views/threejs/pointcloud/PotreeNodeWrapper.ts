/*!
 * Copyright 2019 Cognite AS
 */

// @ts-ignore
import * as Potree from '@cognite/potree-core';
import { PotreePointSizeType, PotreePointColorType, PotreePointShape } from './enums';

/**
 * Wrapper around `Potree.PointCloudOctree` with some convinence functions.
 */
export class PotreeNodeWrapper {
  readonly octtree: Potree.PointCloudOctree;

  constructor(octtree: Potree.PointCloudOctree) {
    this.octtree = octtree;
    this.pointSize = 2;
    this.pointSizeType = PotreePointSizeType.Adaptive;
    this.pointColorType = PotreePointColorType.Rgb;
    this.pointShape = PotreePointShape.Circle;
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
