/*!
 * Copyright 2020 Cognite AS
 */

import * as Potree from '@cognite/potree-core';
import * as THREE from 'three';

import { PotreePointSizeType, PotreePointColorType, PotreePointShape } from './types';
import { fromThreeJsBox3 } from '../../utilities';
import { Box3 } from '../../utilities/Box3';
import { vec3 } from 'gl-matrix';

export type PotreeClassification = { [pointClass: number]: { x: number; y: number; z: number; w: number } };

/**
 * Wrapper around `Potree.PointCloudOctree` with some convinence functions.
 */
export class PotreeNodeWrapper {
  readonly octtree: Potree.PointCloudOctreeNode;
  private _needsRedraw = false;

  get needsRedraw() {
    return this._needsRedraw;
  }

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
    this._needsRedraw = true;
  }

  get pointSizeType(): PotreePointSizeType {
    return this.octtree.material.pointSizeType;
  }
  set pointSizeType(type: PotreePointSizeType) {
    this.octtree.material.pointSizeType = type;
    this._needsRedraw = true;
  }

  get pointBudget(): number {
    return this.octtree.pointBudget;
  }
  set pointBudget(count: number) {
    this.octtree.pointBudget = count;
    this._needsRedraw = true;
  }
  get visiblePointCount(): number {
    return this.octtree.numVisiblePoints || 0;
  }

  get boundingBox(): Box3 {
    const transformedBbox: THREE.Box3 =
      this.octtree.pcoGeometry.tightBoundingBox || this.octtree.pcoGeometry.boundingBox || this.octtree.boundingBox;
    const box = fromThreeJsBox3(transformedBbox);
    // Apply transformation to switch axes
    const min = vec3.fromValues(box.min[0], box.min[2], -box.min[1]);
    const max = vec3.fromValues(box.max[0], box.max[2], -box.max[1]);
    return new Box3([min, max]);
  }

  get pointColorType(): PotreePointColorType {
    return this.octtree.material.pointColorType;
  }
  set pointColorType(type: PotreePointColorType) {
    this.octtree.material.pointColorType = type;
    this._needsRedraw = true;
  }

  get pointShape(): PotreePointShape {
    return this.octtree.material.shape;
  }
  set pointShape(shape: PotreePointShape) {
    this.octtree.material.shape = shape;
    this._needsRedraw = true;
  }

  get classification(): PotreeClassification {
    return this.octtree.material.classification as PotreeClassification;
  }

  recomputeClassification() {
    this.octtree.material.recomputeClassification();
  }

  resetNeedsRedraw() {
    this._needsRedraw = false;
  }
}
