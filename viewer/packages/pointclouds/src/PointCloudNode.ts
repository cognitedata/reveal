/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CameraConfiguration } from '@reveal/utilities';

import { PotreeGroupWrapper } from './PotreeGroupWrapper';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { WellKnownAsprsPointClassCodes } from './types';
import { createPointClassKey } from './createPointClassKey';

import { PickPoint, PotreePointColorType, PotreePointShape, PotreePointSizeType } from './potree-three-loader';

import { PointCloudAppearance } from './styling/PointCloudAppearance';
import { StylablePointCloudObjectCollection } from './styling/StyledPointCloudObjectCollection';

const PotreeDefaultPointClass = 'DEFAULT';

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
    this.add(this._potreeNode.octree);

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

  requestRedraw(): void {
    this._potreeGroup.requestRedraw();
  }

  get pointSize(): number {
    return this._potreeNode.pointSize;
  }

  set pointSize(size: number) {
    this._potreeNode.pointSize = size;
  }

  get pointSizeType(): PotreePointSizeType {
    return this._potreeNode.octree.pointSizeType;
  }

  set pointSizeType(pointSizeType: PotreePointSizeType) {
    this._potreeNode.octree.pointSizeType = pointSizeType;
  }

  get visiblePointCount(): number {
    return this._potreeNode.visiblePointCount;
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
   * GPU-based picking allowing to get point data based on ray directing from the camera.
   * @param renderer Renderer object used for Reveal rendereing.
   * @param camera Camera object used for Reveal rendering.
   * @param ray Ray representing the direction for picking.
   * @returns Picked point data.
   */
  pick(renderer: THREE.WebGLRenderer, camera: THREE.Camera, ray: THREE.Ray): PickPoint | null {
    return this._potreeNode.pick(renderer, camera, ray);
  }
  /**
   * Sets a visible filter on points of a given class.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @param visible Boolean flag that determines if the point class type should be visible or not.
   * @throws Error if the model doesn't have the class given.
   */
  setClassVisible(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    this._potreeNode.setClassificationAndRecompute(pointClass, visible);
  }

  /**
   * Determines if points from a given class are visible.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @returns true if points from the given class will be visible.
   * @throws Error if the model doesn't have the class given.
   */
  isClassVisible(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    if (!this.hasClass(pointClass)) {
      throw new Error(`Point cloud model doesn't have class ${pointClass}`);
    }
    const key = createPointClassKey(pointClass);
    return this._potreeNode.classification[key].w !== 0.0;
  }

  /**
   * Returns true if the model has values with the given classification class.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @returns true if model has values in the class given.
   */
  hasClass(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    const key = createPointClassKey(pointClass);
    return this._potreeNode.classification[key] !== undefined;
  }

  /**
   * Returns a list of sorted classification codes present in the model.
   * @returns A sorted list of classification codes from the model.
   */
  getClasses(): Array<number | WellKnownAsprsPointClassCodes> {
    return Object.keys(this._potreeNode.classification)
      .map(x => {
        return x === PotreeDefaultPointClass ? -1 : parseInt(x, 10);
      })
      .sort((a, b) => a - b);
  }

  getBoundingBox(outBbox?: THREE.Box3): THREE.Box3 {
    outBbox = outBbox || new THREE.Box3();
    outBbox.copy(this._potreeNode.boundingBox);
    outBbox.applyMatrix4(this.matrixWorld);
    return outBbox;
  }

  setModelTransformation(matrix: THREE.Matrix4): void {
    this._potreeNode.octree.applyMatrix4(matrix);
    this._potreeNode.octree.updateMatrix();
    this._potreeNode.octree.updateWorldMatrix(true, true);
  }

  getModelTransformation(out = new THREE.Matrix4()): THREE.Matrix4 {
    return out.copy(this.matrix);
  }

  get defaultAppearance(): PointCloudAppearance {
    return this._potreeNode.defaultAppearance;
  }

  set defaultAppearance(appearance: PointCloudAppearance) {
    this._potreeNode.octree.material.objectAppearanceTexture.defaultAppearance = appearance;
  }

  assignStyledPointCloudObjectCollection(styledCollection: StylablePointCloudObjectCollection): void {
    this._potreeNode.setObjectStyle(styledCollection);
  }

  removeAllStyledPointCloudOjects(): void {
    this._potreeNode.octree.material.objectAppearanceTexture.removeAllStyledObjectSets();
  }
}
