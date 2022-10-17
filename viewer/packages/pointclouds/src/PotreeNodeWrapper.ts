/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export type PotreeClassification = { [pointClass: number]: { x: number; y: number; z: number; w: number } };
const PotreeDefaultPointClass = 'DEFAULT';

type ClassificationMap = { [key: string]: { rgb: THREE.Color; code: number } };

import { StyledPointCloudObjectCollection, CompletePointCloudAppearance } from '@reveal/pointcloud-styling';

export type PointClassification = { [pointClass: number]: { x: number; y: number; z: number; w: number } };

import { PointCloudOctree, PickPoint } from './potree-three-loader';
import { PointColorType, PointShape, IClassification, DEFAULT_CLASSIFICATION } from '@reveal/rendering';

import { WellKnownAsprsPointClassCodes } from './types';

import { PointCloudObjectMetadata, PointCloudObject } from '@reveal/data-providers';
import { ClassificationInfo } from './potree-three-loader/loading/ClassificationInfo';
import { createDistinctColors } from '@reveal/utilities';

/**
 * Wrapper around `Potree.PointCloudOctree` with some convenience functions.
 */
export class PotreeNodeWrapper {
  readonly octree: PointCloudOctree;
  private _needsRedraw = false;
  private readonly _classification: IClassification;

  private readonly _modelIdentifier: symbol;

  private static readonly pickingWindowSize = 20;

  private readonly _classNameToCodeMap: ClassificationMap;

  private readonly _annotations: PointCloudObject[];

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
    this._classification = octree.material.classification;
    this._annotations = annotations;
    this._modelIdentifier = modelIdentifier;
    this._classNameToCodeMap = this.createClassNameToCodeMap(classificationInfo);

    this.updateMaterialClassMap(this._classNameToCodeMap);
  }

  private createClassNameToCodeMap(classificationInfo: ClassificationInfo): ClassificationMap {
    if (classificationInfo.classificationSets.length === 0) {
      return this.createDefaultClassNameToCodeMap();
    }

    const classMap: { [key: string]: { rgb: THREE.Color; code: number } } = {};

    const inputClassifications = classificationInfo.classificationSets[0].classificationSet;

    const fallbackColors = createDistinctColors(inputClassifications.length);

    inputClassifications.forEach((pointClass, index) => {
      const rgb = pointClass.rgb ? new THREE.Color(pointClass.rgb) : fallbackColors[index];

      classMap[pointClass.name] = { rgb, code: pointClass.code };
    });

    return classMap;
  }

  private getDefaultClassColor(name: string): THREE.Color | undefined {
    if (!DEFAULT_CLASSIFICATION[name]) {
      return undefined;
    }

    const v = DEFAULT_CLASSIFICATION[name];
    return new THREE.Color(v.x, v.y, v.z);
  }

  private createDefaultClassNameToCodeMap(): ClassificationMap {
    const classNames = Object.keys(this._classification);

    const classMap: { [key: string]: { rgb: THREE.Color; code: number } } = {};
    const fallbackColors = createDistinctColors(classNames.length);

    classNames.forEach((x, index) => {
      const code = x === PotreeDefaultPointClass ? -1 : parseInt(x, 10);
      const rgb = this.getDefaultClassColor(x) ?? fallbackColors[index];
      classMap[this.getClassNameFromCode(code)] = { code, rgb };
    });

    return classMap;
  }

  private updateMaterialClassMap(classificationMap: ClassificationMap) {
    Object.keys(classificationMap).forEach(name => {
      const color = classificationMap[name].rgb;
      this._classification[classificationMap[name].code] = new THREE.Vector4(...color.toArray(), 1.0);
    });
    this.octree.material.classification = this._classification;
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
    return this._classification;
  }

  private getClassNameFromCode(code: number): string {
    return WellKnownAsprsPointClassCodes[code] ?? `Class ${code}`;
  }

  get classNames(): Array<{ name: string; code: number }> {
    const codesAndNames = Object.entries(this._classNameToCodeMap).map(nameAndCode => ({
      name: nameAndCode[0],
      code: nameAndCode[1].code
    }));

    return codesAndNames.sort((a, b) => a.code - b.code);
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
    if (this._classNameToCodeMap[this.getClassNameFromCode(pointClass)] !== undefined) {
      return this._classNameToCodeMap[this.getClassNameFromCode(pointClass)].code;
    }

    if (typeof pointClass === 'string') {
      throw Error(`Unrecognized string ${pointClass} used as class name`);
    }

    if (pointClass === WellKnownAsprsPointClassCodes.Default) {
      // Potree has a special class 'DEFAULT'. Our map has number keys, but this one is specially
      // handled in Potree so we ignore type.
      return PotreeDefaultPointClass as any;
    }

    return pointClass;
  }

  setClassificationAndRecompute(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    const key = this.createPointClassKey(pointClass);

    this._classification[key].w = visible ? 1.0 : 0.0;
    this.octree.material.classification = this._classification;
    this._needsRedraw = true;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }
}
