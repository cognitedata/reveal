/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { PotreeGroupWrapper } from './PotreeGroupWrapper';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { CameraConfiguration, toThreeJsBox3 } from '@/utilities';
import { PotreePointSizeType, PotreePointColorType, PotreePointShape, WellKnownAsprsPointClassCodes } from './types';

export class PointCloudNode extends THREE.Group {
  private readonly _potreeGroup: PotreeGroupWrapper;
  private readonly _potreeNode: PotreeNodeWrapper;
  private readonly _cameraConfiguration?: CameraConfiguration;

  constructor(
    potreeGroup: PotreeGroupWrapper,
    potreeNode: PotreeNodeWrapper,
    cameraConfiguration?: CameraConfiguration
  ) {
    super();
    this.name = 'PointCloudNode';
    this._potreeGroup = potreeGroup;
    this._potreeNode = potreeNode;
    this._cameraConfiguration = cameraConfiguration;
    this.add(this._potreeGroup);

    this.matrixAutoUpdate = false;
  }

  get potreeGroup(): PotreeGroupWrapper {
    return this._potreeGroup;
  }

  get potreeNode(): PotreeNodeWrapper {
    return this._potreeNode;
  }

  get hasCameraConfiguration(): boolean {
    return this._cameraConfiguration !== undefined;
  }

  get cameraConfiguration(): CameraConfiguration | undefined {
    return this._cameraConfiguration;
  }

  get needsRedraw(): boolean {
    return this._potreeGroup.needsRedraw;
  }

  requestRedraw() {
    this._potreeGroup.requestRedraw();
  }

  get pointSize(): number {
    return this._potreeNode.pointSize;
  }

  set pointSize(size: number) {
    this._potreeNode.pointSize = size;
  }

  get pointSizeType(): PotreePointSizeType {
    return this._potreeNode.pointSizeType;
  }

  set pointSizeType(value: PotreePointSizeType) {
    this._potreeNode.pointSizeType = value;
  }

  get pointBudget(): number {
    return this._potreeNode.pointBudget;
  }

  set pointBudget(count: number) {
    this._potreeNode.pointBudget = count;
  }

  get pointColorType(): PotreePointColorType {
    return this._potreeNode.pointColorType;
  }

  set pointColorType(type: PotreePointColorType) {
    this._potreeNode.pointColorType = type;
  }

  get pointShape(): PotreePointShape {
    return this._potreeNode.pointShape;
  }

  set pointShape(value: PotreePointShape) {
    this._potreeNode.pointShape = value;
  }

  /**
   * Sets a visible filter on points of a given class.
   * @param pointClass ASPRS classification class code. Either one of the well known 
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @param visible Boolean flag that determines if the point class type should be visible or not.
   * @throws Error if the model doesn't have the class given.
   */
  setClassVisible(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    if (!this.hasClass(pointClass)) {
      throw new Error(`Point cloud model doesn't have class ${pointClass}`);
    }
    this._potreeNode.classification[pointClass].w = visible ? 1.0 : 0.0;
    this._potreeNode.recomputeClassification();
  }

  /**
   * Determines if points from a given class are visible.
   * @param pointClass ASPRS classification class code. Either one of the well known 
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @return true if points from the given class will be visible.
   * @throws Error if the model doesn't have the class given.
   */
  isClassVisible(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    if (!this.hasClass(pointClass)) {
      throw new Error(`Point cloud model doesn't have class ${pointClass}`);
    }
    return this._potreeNode.classification[pointClass].w !== 0.0;
  }

  /**
   * Returns true if the model has values with the given classification class.
   * @param pointClass ASPRS classification class code. Either one of the well known 
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @return true if model has values in the class given.
   */
  hasClass(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    return this._potreeNode.classification[pointClass] !== undefined;
  }

  /**
   * Returns a list of sorted classification codes present in the model.
   * @returns A sorted list of classification codes from the model.
   */
  getClasses(): number | WellKnownAsprsPointClassCodes[] {
    return Object.keys(this._potreeNode.classification).map(x => parseInt(x, 10)).sort((a,b) => a - b);
  }

  getBoundingBox(outBbox?: THREE.Box3): THREE.Box3 {
    outBbox = toThreeJsBox3(outBbox || new THREE.Box3(), this._potreeNode.boundingBox);
    outBbox.applyMatrix4(this.matrixWorld);
    return outBbox;
  }

  setModelTransformation(matrix: THREE.Matrix4): void {
    this.matrix.copy(matrix);
    this.updateMatrixWorld(true);
  }

  getModelTransformation(out = new THREE.Matrix4()): THREE.Matrix4 {
    return out.copy(this.matrix);
  }
}
