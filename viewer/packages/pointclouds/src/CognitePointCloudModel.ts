/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CameraConfiguration } from '@reveal/utilities';
import { WellKnownAsprsPointClassCodes } from './types';
import { PointCloudNode } from './PointCloudNode';

import { PointColorType, PointShape, PointSizeType } from '@reveal/rendering';

import { SupportedModelTypes } from '@reveal/model-base';
import { PointCloudObjectMetadata } from '@reveal/data-providers';

import {
  StyledPointCloudObjectCollection,
  PointCloudObjectCollection,
  applyDefaultsToPointCloudAppearance,
  PointCloudAppearance,
  CompletePointCloudAppearance
} from '@reveal/pointcloud-styling';

/**
 * Represents a point clouds model loaded from CDF.
 * @noInheritDoc
 * @module @cognite/reveal
 */
export class CognitePointCloudModel {
  public readonly type: SupportedModelTypes = 'pointcloud';
  public readonly modelId: number;
  /**
   * The modelId of the point cloud model in Cognite Data Fusion.
   */
  public readonly revisionId: number;
  /**
   * The revisionId of the specific model revision in Cognite Data Fusion.
   * @internal
   */
  readonly pointCloudNode: PointCloudNode;

  private readonly _styledObjectCollections: StyledPointCloudObjectCollection[] = [];

  /**
   * @param modelId
   * @param revisionId
   * @param pointCloudNode
   * @internal
   */
  constructor(modelId: number, revisionId: number, pointCloudNode: PointCloudNode) {
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.pointCloudNode = pointCloudNode;
  }

  /**
   * Used to clean up memory.
   */
  dispose(): void {}

  // eslint-disable-next-line jsdoc/require-description
  /**
   * @param outBbox Optional. Used to write result to.
   * @returns Model's bounding box.
   * @example
   * ```js
   * const box = new THREE.Box3()
   * model.getModelBoundingBox(box);
   * // box now has the bounding box
   *```
   * ```js
   * // the following code does the same
   * const box = model.getModelBoundingBox();
   * ```
   */
  getModelBoundingBox(outBbox?: THREE.Box3): THREE.Box3 {
    return this.pointCloudNode.getBoundingBox(outBbox);
  }

  /**
   * Retrieves the camera position and target stored for the model. Typically this
   * is used to store a good starting position for a model. Returns `undefined` if there
   * isn't any stored camera configuration for the model.
   */
  getCameraConfiguration(): CameraConfiguration | undefined {
    return this.pointCloudNode.cameraConfiguration;
  }

  /**
   * Sets transformation matrix of the model. This overrides the current transformation.
   * @param transformationMatrix The new transformation matrix
   */
  setModelTransformation(transformationMatrix: THREE.Matrix4): void {
    this.pointCloudNode.setModelTransformation(transformationMatrix);
  }

  /**
   * Gets transformation matrix that has previously been
   * set with {@link CognitePointCloudModel.setModelTransformation}.
   * @param out Preallocated `THREE.Matrix4` (optional).
   */
  getModelTransformation(out?: THREE.Matrix4): THREE.Matrix4 {
    return this.pointCloudNode.getModelTransformation(out);
  }

  /**
   * Gets transformation from CDF space to ThreeJS space,
   * which includes any additional "default" transformations assigned to this model.
   * Does not include any custom transformations set by {@link CognitePointCloudModel.setModelTransformation}
   * @param out Preallocated `THREE.Matrix4` (optional)
   */
  getCdfToDefaultModelTransformation(out?: THREE.Matrix4): THREE.Matrix4 {
    return this.pointCloudNode.getCdfToDefaultModelTransformation(out);
  }

  /**
   * Map point from CDF to model space, taking the model's custom transformation into account
   * @param point Point to compute transformation from
   * @param out Optional pre-allocated point
   */
  mapPointFromCdfToModelCoordinates(point: THREE.Vector3, out: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const cdfToModelTransformation = this.getModelTransformation().multiply(this.getCdfToDefaultModelTransformation());
    return out.copy(point).applyMatrix4(cdfToModelTransformation);
  }

  /**
   * Map bounding box from CDF to model space, taking the model's custom transformation into account
   * @param box Box to compute transformation from
   * @param out Optional pre-allocated box
   */
  mapBoxFromCdfToModelCoordinates(box: THREE.Box3, out: THREE.Box3 = new THREE.Box3()): THREE.Box3 {
    const cdfToModelTransformation = this.getModelTransformation().multiply(this.getCdfToDefaultModelTransformation());
    return out.copy(box).applyMatrix4(cdfToModelTransformation);
  }

  /**
   * Sets a visible filter on points of a given class.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @param visible Boolean flag that determines if the point class type should be visible or not.
   * @throws Error if the model doesn't have the class given.
   */
  setClassVisible(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    this.pointCloudNode.setClassVisible(pointClass, visible);
  }

  /**
   * Determines if points from a given class are visible.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @returns True if points from the given class will be visible.
   * @throws Error if the model doesn't have the class given.
   */
  isClassVisible(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    return this.pointCloudNode.isClassVisible(pointClass);
  }

  /**
   * Returns true if the model has values with the given classification class.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @returns True if model has values in the class given.
   */
  hasClass(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    return this.pointCloudNode.hasClass(pointClass);
  }

  /**
   * Returns a list of sorted classification names and codes present in the model.
   * Names will be the custom names provided by the user, or a default one if none have been provided.
   * @returns A sorted list of classification codes and names from the model.
   */
  getClasses(): Array<{ name: string; code: number | WellKnownAsprsPointClassCodes }> {
    return this.pointCloudNode.getClasses();
  }

  /**
   * Returns the current number of visible/loaded points.
   */
  get visiblePointCount(): number {
    return this.pointCloudNode.visiblePointCount;
  }

  /**
   * Determines how points currently are colored.
   */
  get pointColorType(): PointColorType {
    return this.pointCloudNode.pointColorType;
  }

  /**
   * Specifies how points are colored.
   * @default PointColorType.Rgb
   * @example
   * ```js
   * model.pointColorType = PointColorType.Rgb
   * ```
   */
  set pointColorType(type: PointColorType) {
    this.pointCloudNode.pointColorType = type;
  }

  /**
   * Returns the size of each rendered point in the point cloud.
   */
  get pointSize(): number {
    return this.pointCloudNode.pointSize;
  }

  /**
   * Sets the size of each rendered point in the point cloud.
   * @default `1`
   */
  set pointSize(size: number) {
    this.pointCloudNode.pointSize = size;
  }

  /**
   * Get the point size type.
   */
  get pointSizeType(): PointSizeType {
    return this.pointCloudNode.pointSizeType;
  }

  /**
   * Set the point size type for the point cloud.
   * The point size type can be either Fixed or Adaptive.
   * @default `PointSizeType.Adaptive`
   */
  set pointSizeType(type: PointSizeType) {
    this.pointCloudNode.pointSizeType = type;
  }

  /**
   * Sets the point shape of each rendered point in the point cloud.
   * @default `PointShape.Circle`
   * @see {@link PointShape}.
   */
  get pointShape(): PointShape {
    return this.pointCloudNode.pointShape;
  }

  /**
   * Gets the point shape of each rendered point in the point cloud.
   * @see {@link PointShape}.
   */
  set pointShape(shape: PointShape) {
    this.pointCloudNode.pointShape = shape;
  }

  /**
   * Sets the model visibility.
   * @example
   * ```js
   * model.visible = false
   * ```
   */
  set visible(value: boolean) {
    this.pointCloudNode.visible = value;
  }

  /**
   * Returns the model visibility.
   */
  get visible(): boolean {
    return this.pointCloudNode.visible;
  }

  /**
   * Sets the clipping planes for this model. They will be combined with the
   * global clipping planes.
   */
  setModelClippingPlanes(clippingPlanes: THREE.Plane[]): void {
    this.pointCloudNode.clippingPlanes = clippingPlanes;
  }

  /**
   * Get the clipping planes for this model.
   */
  getModelClippingPlanes(): THREE.Plane[] {
    return [...this.pointCloudNode.clippingPlanes];
  }

  /**
   * Gets default point appearance
   */
  getDefaultPointCloudAppearance(): PointCloudAppearance {
    return this.pointCloudNode.defaultAppearance;
  }

  /**
   * Sets default apparance for points that are not styled otherwise
   * @param appearance Appearance to assign as default
   */
  setDefaultPointCloudAppearance(appearance: PointCloudAppearance): void {
    const fullAppearance: CompletePointCloudAppearance = applyDefaultsToPointCloudAppearance(appearance);
    this.pointCloudNode.defaultAppearance = fullAppearance;
  }

  /**
   * Gets the object collections that have been assigned a style
   * @returns All object collections and their associated style
   */
  get styledCollections(): StyledPointCloudObjectCollection[] {
    return this._styledObjectCollections;
  }

  /**
   * Assign a style to a collection of objects. If the object collection has been assigned
   * a style previously, the previous style will be replaced by the new one.
   * @param objectCollection The object collection to assign a style to
   * @param appearance The style to assign to the object collection
   */
  assignStyledObjectCollection(objectCollection: PointCloudObjectCollection, appearance: PointCloudAppearance): void {
    const fullAppearance: CompletePointCloudAppearance = applyDefaultsToPointCloudAppearance(appearance);
    const index = this._styledObjectCollections.findIndex(x => x.objectCollection === objectCollection);
    if (index !== -1) {
      this._styledObjectCollections[index].style = fullAppearance;
      this.pointCloudNode.assignStyledPointCloudObjectCollection(this._styledObjectCollections[index]);
    } else {
      const newObjectCollection = new StyledPointCloudObjectCollection(objectCollection, fullAppearance);

      this._styledObjectCollections.push(newObjectCollection);
      this.pointCloudNode.assignStyledPointCloudObjectCollection(newObjectCollection);
    }
  }

  /**
   * Unassign style from an already styled object collection.
   * @param objectCollection The object collection from which to remove the style
   */
  unassignStyledObjectCollection(objectCollection: PointCloudObjectCollection): void {
    const styledCollectionIndex = this._styledObjectCollections.findIndex(x => x.objectCollection === objectCollection);

    if (styledCollectionIndex === -1) {
      return;
    }

    this._styledObjectCollections.splice(styledCollectionIndex, 1);

    this.pointCloudNode.removeAllStyledPointCloudObjects();

    for (const styledObjectCollection of this._styledObjectCollections) {
      this.pointCloudNode.assignStyledPointCloudObjectCollection(styledObjectCollection);
    }
  }

  /**
   * Removes styling on all object collections in this model
   */
  removeAllStyledObjectCollections(): void {
    this.pointCloudNode.removeAllStyledPointCloudObjects();
    this._styledObjectCollections.splice(0);
  }

  /**
   * @returns The number of stylable objects
   */
  get stylableObjectCount(): number {
    return this.pointCloudNode.stylableObjectCount;
  }

  /**
   * Iterates through all stylable objects for this model
   * @example
   * ```js
   * model.traverseStylableObjects(
   *     annotationMetadata => console.log(annotationMetadata.annotationId)
   * );
   * ```
   */
  traverseStylableObjects(callback: (annotationMetadata: PointCloudObjectMetadata) => void): void {
    for (const obj of this.pointCloudNode.stylableObjectAnnotationMetadata) {
      callback(obj);
    }
  }
}
