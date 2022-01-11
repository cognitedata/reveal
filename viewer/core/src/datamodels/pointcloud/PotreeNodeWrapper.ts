/*!
 * Copyright 2021 Cognite AS
 */

import * as Potree from '@cognite/potree-core';
import * as THREE from 'three';

import { PotreePointSizeType, PotreePointColorType, PotreePointShape } from './types';

export type PotreeClassification = { [pointClass: number]: { x: number; y: number; z: number; w: number } };

/**
 * Wrapper around `Potree.PointCloudOctree` with some convinence functions.
 */
export class PotreeNodeWrapper {
  readonly octtree: Potree.PointCloudOctreeNode;
  private _needsRedraw = false;

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  constructor(octtree: Potree.PointCloudOctreeNode) {
    this.octtree = octtree;
    this.pointSize = 2;
    this.pointSizeType = PotreePointSizeType.Adaptive;
    this.pointColorType = PotreePointColorType.Rgb;
    this.pointShape = PotreePointShape.Circle;

    this.pointBudget = Infinity;
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

  get boundingBox(): THREE.Box3 {
    const box: THREE.Box3 =
      this.octtree.pcoGeometry.tightBoundingBox || this.octtree.pcoGeometry.boundingBox || this.octtree.boundingBox;
    // Apply transformation to switch axes
    const min = new THREE.Vector3(box.min.x, box.min.z, -box.min.y);
    const max = new THREE.Vector3(box.max.x, box.max.z, -box.max.y);
    return new THREE.Box3().setFromPoints([min, max]);
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

  recomputeClassification(): void {
    this.octtree.material.recomputeClassification();
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }
}
