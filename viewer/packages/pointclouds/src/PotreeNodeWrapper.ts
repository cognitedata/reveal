/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { StyledPointCloudObjectCollection, CompletePointCloudAppearance } from '@reveal/pointcloud-styling';

import { PointCloudOctree, PickPoint } from './potree-three-loader';
import { PointColorType, PointShape, PointClassification } from '@reveal/rendering';

import { WellKnownAsprsPointClassCodes } from './types';

import { PointCloudObjectMetadata, PointCloudObject } from '@reveal/data-providers';
import { ClassificationInfo } from './potree-three-loader/loading/ClassificationInfo';
import { ClassificationHandler } from './ClassificationHandler';

/**
 * Wrapper around `Potree.PointCloudOctree` with some convenience functions.
 */
export class PotreeNodeWrapper {
  readonly octree: PointCloudOctree;
  private _needsRedraw = false;

  private readonly _modelIdentifier: symbol;

  private static readonly pickingWindowSize = 20;

  private readonly _annotations: PointCloudObject[];

  private readonly _classificationHandler: ClassificationHandler;

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  constructor(
    modelIdentifier: symbol,
    octree: PointCloudOctree,
    annotations: PointCloudObject[],
    classificationInfo: ClassificationInfo
  ) {
    this.octree = octree;
    this.pointSize = 2;
    this.pointColorType = PointColorType.Rgb;
    this.pointShape = PointShape.Circle;
    this._annotations = annotations;
    this._modelIdentifier = modelIdentifier;
    this._classificationHandler = new ClassificationHandler(octree.material,
                                                            classificationInfo);
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
    return box.clone().applyMatrix4(this.octree.matrixWorld);
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
    return this._classificationHandler.classification;
  }

  get classes(): Array<{ name: string; code: number }> {
    return this._classificationHandler.classes;
  }

  get stylableObjectAnnotationMetadata(): Iterable<PointCloudObjectMetadata> {
    return this._annotations.map(a => {
      return {
        annotationId: a.annotationId,
        assetId: a.assetId,
        boundingBox: a.boundingBox.clone().applyMatrix4(this.octree.matrixWorld)
      };
    });
  }

  get stylableObjects(): PointCloudObject[] {
    return this._annotations;
  }

  get defaultAppearance(): CompletePointCloudAppearance {
    return this.octree.material.objectAppearanceTexture.defaultAppearance;
  }

  set defaultAppearance(appearance: CompletePointCloudAppearance) {
    this.octree.material.objectAppearanceTexture.defaultAppearance = appearance;
    this._needsRedraw = true;
  }

  pick(renderer: THREE.WebGLRenderer, camera: THREE.Camera, ray: THREE.Ray): PickPoint | null {
    return this.octree.pick(renderer, camera, ray, { pickWindowSize: PotreeNodeWrapper.pickingWindowSize });
  }

  assignObjectStyle(styledCollection: StyledPointCloudObjectCollection): void {
    this.octree.material.objectAppearanceTexture.assignStyledObjectSet(styledCollection);
    this._needsRedraw = true;
  }

  createPointClassKey(pointClass: number | WellKnownAsprsPointClassCodes): number {
    return this._classificationHandler.createPointClassKey(pointClass);
  }

  setClassificationAndRecompute(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    this._classificationHandler.setClassificationAndRecompute(pointClass, visible);
    this._needsRedraw = true;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }
}
