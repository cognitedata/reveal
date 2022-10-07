/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export type PointClassification = { [pointClass: number]: { x: number; y: number; z: number; w: number } };

import { PointCloudOctree, PickPoint } from './potree-three-loader';
import { PointColorType, PointShape, IClassification } from '@reveal/rendering';
import { WellKnownAsprsPointClassCodes } from './types';

import { createPointClassKey } from './createPointClassKey';

/**
 * Wrapper around `Potree.PointCloudOctree` with some convenience functions.
 */
export class PotreeNodeWrapper {
  readonly octree: PointCloudOctree;
  private _needsRedraw = false;
  private readonly _classification: IClassification = {} as IClassification;
  private readonly _modelIdentifier: symbol;

  private static readonly pickingWindowSize = 20;

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  constructor(octree: PointCloudOctree, modelIdentifier: symbol) {
    this.octree = octree;
    this.pointSize = 2;
    this.pointColorType = PointColorType.Rgb;
    this.pointShape = PointShape.Circle;
    this._classification = octree.material.classification;
    this._modelIdentifier = modelIdentifier;
  }

  get modelIdentifier(): symbol {
    return this._modelIdentifier;
  }

  get pointSize(): number {
    return this.octree.material.size;
  }
  set pointSize(size: number) {
    this.octree.material.size = size;
    this._needsRedraw = true;
  }

  get visiblePointCount(): number {
    return this.octree.numVisiblePoints || 0;
  }

  get boundingBox(): THREE.Box3 {
    const box: THREE.Box3 =
      this.octree.pcoGeometry.tightBoundingBox || this.octree.pcoGeometry.boundingBox || this.octree.boundingBox;
    // Apply transformation to switch axes
    const min = new THREE.Vector3(box.min.x, box.min.z, -box.min.y);
    const max = new THREE.Vector3(box.max.x, box.max.z, -box.max.y);
    return new THREE.Box3().setFromPoints([min, max]);
  }

  get pointColorType(): PointColorType {
    return this.octree.material.pointColorType;
  }
  set pointColorType(type: PointColorType) {
    this.octree.material.pointColorType = type;
    this._needsRedraw = true;
  }

  get pointShape(): PointShape {
    return this.octree.material.shape;
  }
  set pointShape(shape: PointShape) {
    this.octree.material.shape = shape;
    this._needsRedraw = true;
  }

  get classification(): PointClassification {
    return this._classification;
  }

  pick(renderer: THREE.WebGLRenderer, camera: THREE.Camera, ray: THREE.Ray): PickPoint | null {
    return this.octree.pick(renderer, camera, ray, { pickWindowSize: PotreeNodeWrapper.pickingWindowSize });
  }

  setClassificationAndRecompute(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    const key = createPointClassKey(pointClass);

    this._classification[key].w = visible ? 1.0 : 0.0;
    this.octree.material.classification = this._classification;
    this._needsRedraw = true;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }
}
