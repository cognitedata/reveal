/*!
 * Copyright 2021 Cognite AS
 */

import { CameraConfiguration } from '@reveal/utilities';

import { ClassificationInfo, PointCloudOctree, PickPoint } from './potree-three-loader';
import { WellKnownAsprsPointClassCodes } from './types';

import { PointColorType, PointShape, PointSizeType } from '@reveal/rendering';

import {
  InternalDataSourceType,
  isClassicPointCloudDataTypeObject,
  isDMPointCloudDataTypeObject,
  PointCloudObject,
  PointCloudObjectMetadata
} from '@reveal/data-providers';
import { ClassificationHandler } from './ClassificationHandler';

import { CompletePointCloudAppearance } from '@reveal/pointcloud-styling';

import { Matrix4, Group, Box3, Color, type Camera, type Plane, type Ray, type WebGLRenderer } from 'three';
import { InternalStyledPointCloudVolumeCollection } from '@reveal/pointcloud-styling';

export class PointCloudNode<T extends InternalDataSourceType = InternalDataSourceType> extends Group {
  private readonly _cameraConfiguration?: CameraConfiguration;
  private readonly _octree: PointCloudOctree;

  private readonly _objectIdToAnnotationsMap: Map<number, PointCloudObject<T>>;
  private readonly _classificationHandler: ClassificationHandler;

  private _needsRedraw: boolean = false;
  private static readonly pickingWindowSize = 20;

  private readonly _modelIdentifier: symbol;

  private readonly _sourceTransform: Matrix4;
  private readonly _customTransform: Matrix4;

  constructor(
    modelIdentifier: symbol,
    sourceTransform: Matrix4,
    octree: PointCloudOctree,
    annotations: PointCloudObject<T>[],
    classificationInfo: ClassificationInfo,
    cameraConfiguration?: CameraConfiguration
  ) {
    super();

    this._octree = octree;
    this.add(this._octree);

    this.pointSize = 2;
    this.pointColorType = PointColorType.Rgb;
    this.pointShape = PointShape.Circle;

    this._modelIdentifier = modelIdentifier;

    this.name = 'PointCloudNode';
    this._cameraConfiguration = cameraConfiguration;

    this._objectIdToAnnotationsMap = createObjectIdToAnnotationsMap(annotations);
    this._classificationHandler = new ClassificationHandler(this._octree.material, classificationInfo);

    this.matrixAutoUpdate = false;

    this._sourceTransform = new Matrix4().copy(sourceTransform);
    this.matrix.copy(this._sourceTransform);
    this._customTransform = new Matrix4();

    this.updateMatrixWorld(true);
  }

  get modelIdentifier(): symbol {
    return this._modelIdentifier;
  }

  get octree(): PointCloudOctree {
    return this._octree;
  }

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }

  get hasCameraConfiguration(): boolean {
    return this._cameraConfiguration !== undefined;
  }

  get cameraConfiguration(): CameraConfiguration | undefined {
    return this._cameraConfiguration;
  }

  get pointSize(): number {
    return this._octree.material.size;
  }

  set pointSize(size: number) {
    this._octree.material.size = size;
    this._needsRedraw = true;
  }

  get pointSizeType(): PointSizeType {
    return this._octree.pointSizeType;
  }

  set pointSizeType(pointSizeType: PointSizeType) {
    this._octree.pointSizeType = pointSizeType;
    this._needsRedraw = true;
  }

  get pointColorType(): PointColorType {
    return this._octree.material.pointColorType;
  }

  set pointColorType(type: PointColorType) {
    this._octree.material.pointColorType = type;
    this._needsRedraw = true;
  }

  get pointShape(): PointShape {
    return this._octree.material.shape;
  }

  set pointShape(value: PointShape) {
    this._octree.material.shape = value;
    this._needsRedraw = true;
  }

  get visiblePointCount(): number {
    return this._octree.numVisiblePoints;
  }

  /**
   * GPU-based picking allowing to get point data based on ray directing from the camera.
   * @param renderer Renderer object used for Reveal rendereing.
   * @param camera Camera object used for Reveal rendering.
   * @param ray Ray representing the direction for picking.
   * @returns Picked point data.
   */
  pick(renderer: WebGLRenderer, camera: Camera, ray: Ray): PickPoint | null {
    return this._octree.pick(renderer, camera, ray, { pickWindowSize: PointCloudNode.pickingWindowSize });
  }
  /**
   * Sets a visible filter on points of a given class.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @param visible Boolean flag that determines if the point class type should be visible or not.
   * @throws Error if the model doesn't have the class given.
   */
  setClassVisible(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    this._classificationHandler.setClassificationAndRecompute(pointClass, visible);
    this._needsRedraw = true;
  }

  /**
   * Determines if points from a given class are visible.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @returns true if points from the given class will be visible.
   * @throws Error if the model doesn't have the class given.
   */
  isClassVisible(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    return this._classificationHandler.isClassVisible(pointClass);
  }

  /**
   * Returns true if the model has values with the given classification class.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @returns true if model has values in the class given.
   */
  hasClass(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    return this._classificationHandler.hasClass(pointClass);
  }

  /**
   * Returns a list of sorted classification codes present in the model.
   * @returns A sorted list of classification codes from the model.
   */
  getClasses(): Array<{ name: string; code: number | WellKnownAsprsPointClassCodes; color: Color }> {
    return this._classificationHandler.classes;
  }

  getBoundingBox(outBbox: Box3 = new Box3()): Box3 {
    const box: Box3 =
      this._octree.pcoGeometry.tightBoundingBox ?? this._octree.pcoGeometry.boundingBox ?? this._octree.boundingBox;

    const transformedBox = box.clone().applyMatrix4(this._octree.matrixWorld);

    outBbox.copy(transformedBox);
    return outBbox;
  }

  setModelTransformation(matrix: Matrix4): void {
    this._customTransform.copy(matrix);
    this.matrix.copy(this._customTransform).multiply(this._sourceTransform);
    this.updateMatrixWorld(true);

    this._needsRedraw = true;
  }

  getModelTransformation(out = new Matrix4()): Matrix4 {
    return out.copy(this._customTransform);
  }

  getCdfToDefaultModelTransformation(out: Matrix4 = new Matrix4()): Matrix4 {
    return out.copy(this._sourceTransform);
  }

  get stylableVolumeMetadata(): Iterable<PointCloudObjectMetadata<T>> {
    return [...this._objectIdToAnnotationsMap.values()].map(a => {
      const baseObject = {
        boundingBox: a.boundingBox.clone().applyMatrix4(this._octree.matrixWorld),
        stylableObject: a.stylableObject
      };

      if (isClassicPointCloudDataTypeObject(a)) {
        return {
          ...baseObject,
          annotationId: a.annotationId,
          assetRef: a.assetRef
        };
      } else if (isDMPointCloudDataTypeObject(a)) {
        return {
          ...baseObject,
          volumeInstanceRef: a.volumeInstanceRef,
          assetRef: a.assetRef
        };
      } else {
        throw new Error('Unknown object type');
      }
    });
  }

  getStylableObjectMetadata(objectId: number): PointCloudObjectMetadata<T> | undefined {
    return this._objectIdToAnnotationsMap.get(objectId);
  }

  get stylableObjectCount(): number {
    return this._objectIdToAnnotationsMap.size;
  }

  get defaultAppearance(): CompletePointCloudAppearance {
    return this._octree.material.objectAppearanceTexture.defaultAppearance;
  }

  set defaultAppearance(appearance: CompletePointCloudAppearance) {
    this._octree.material.objectAppearanceTexture.defaultAppearance = appearance;
    this._needsRedraw = true;
  }

  set clippingPlanes(clippingPlanes: Plane[]) {
    this._octree.setModelClippingPlane(clippingPlanes);
    this._needsRedraw = true;
  }

  assignStyledPointCloudObjectCollection(styledCollection: InternalStyledPointCloudVolumeCollection<T>): void {
    this._octree.material.objectAppearanceTexture.assignStyledObjectSet(styledCollection);
    this._needsRedraw = true;
  }

  removeAllStyledPointCloudObjects(): void {
    this._octree.material.objectAppearanceTexture.removeAllStyledObjectSets();
  }

  dispose(): void {
    this._octree.dispose();
  }
}

function createObjectIdToAnnotationsMap<T extends InternalDataSourceType>(
  annotations: PointCloudObject<T>[]
): Map<number, PointCloudObject<T>> {
  const map = new Map();
  for (const annotation of annotations) {
    map.set(annotation.stylableObject.objectId, annotation);
  }
  return map;
}
