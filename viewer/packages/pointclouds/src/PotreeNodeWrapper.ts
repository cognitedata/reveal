/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export type PotreeClassification = { [pointClass: number]: { x: number; y: number; z: number; w: number } };
const PotreeDefaultPointClass = 'DEFAULT';

import {
  PointCloudOctree,
  PotreePointColorType,
  PotreePointShape,
  IClassification,
  PickPoint
} from './potree-three-loader';
import { WellKnownAsprsPointClassCodes } from './types';

import { StyledPointCloudObjectCollection } from './styling/StyledPointCloudObjectCollection';
import { PointCloudObjectMetadata, PointCloudObjectAnnotation } from './annotationTypes';
import { CompletePointCloudAppearance } from './styling/PointCloudAppearance';

/**
 * Wrapper around `Potree.PointCloudOctree` with some convenience functions.
 */
export class PotreeNodeWrapper {
  readonly octree: PointCloudOctree;
  private _needsRedraw = false;
  private readonly _classification: IClassification = {} as IClassification;

  private readonly _modelIdentifier: symbol;

  private static readonly pickingWindowSize = 20;

  private readonly _classToNumberMap: { [key: string]: number } | undefined;

  private readonly _annotations: PointCloudObjectAnnotation[];

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  constructor(octree: PointCloudOctree,
              annotations: PointCloudObjectAnnotation[],
              modelIdentifier: symbol,
              classToNumberMap: { [key: string]: number } | undefined) {
    this.octree = octree;
    this.pointSize = 2;
    this.pointColorType = PotreePointColorType.Rgb;
    this.pointShape = PotreePointShape.Circle;
    this._classification = octree.material.classification;
    this._annotations = annotations;
    this._modelIdentifier = modelIdentifier;
    this._classToNumberMap = classToNumberMap;
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

  get pointColorType(): PotreePointColorType {
    return this.octree.material.pointColorType;
  }
  set pointColorType(type: PotreePointColorType) {
    this.octree.material.pointColorType = type;
    this._needsRedraw = true;
  }

  get pointShape(): PotreePointShape {
    return this.octree.material.shape;
  }
  set pointShape(shape: PotreePointShape) {
    this.octree.material.shape = shape;
    this._needsRedraw = true;
  }

  get classification(): PotreeClassification {
    return this._classification;
  }

  get classNames(): Array<string> | Array<number> {
    if (this._classToNumberMap) {
      return Object.keys(this._classToNumberMap);
    }

    return Object.keys(this.classification)
      .map(x => {
        return x === PotreeDefaultPointClass ? -1 : parseInt(x, 10);
      })
      .sort((a, b) => a - b);
  }

  get stylableObjectAnnotationIds(): Iterable<PointCloudObjectMetadata> {
    return this._annotations.map(a => {
      return { annotationId: a.annotationId, assetId: a.assetId };
    });
  }

  get stylableObjects(): PointCloudObjectAnnotation[] {
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

  createPointClassKey(pointClass: number | WellKnownAsprsPointClassCodes | string): number {
    if (this._classToNumberMap && this._classToNumberMap[pointClass] !== undefined) {
      return this._classToNumberMap[pointClass];
    }

    if (typeof(pointClass) === 'string') {
      throw Error(`Unrecognized string ${pointClass} used as class name`);
    }

    if (pointClass === WellKnownAsprsPointClassCodes.Default) {
      // Potree has a special class 'DEFAULT'. Our map has number keys, but this one is specially
      // handled in Potree so we ignore type.
      return PotreeDefaultPointClass as any;
    }

    return pointClass;
  }

  setClassificationAndRecompute(pointClass: number | WellKnownAsprsPointClassCodes | string, visible: boolean): void {
    const key = this.createPointClassKey(pointClass);

    this._classification[key].w = visible ? 1.0 : 0.0;
    this.octree.material.classification = this._classification;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }
}
