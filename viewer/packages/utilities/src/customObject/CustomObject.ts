/*!
 * Copyright 2024 Cognite AS
 */

import { Object3D, Box3, PerspectiveCamera } from 'three';
import { CustomObjectIntersection } from './CustomObjectIntersection';
import { CustomObjectIntersectInput } from './CustomObjectIntersectInput';
import { ICustomObject } from './ICustomObject';

/**
 * This class encasulate a Object3D, and made it possible to add flags to it.
 * It might be extended with more flags in the future.
 * @beta
 */
export class CustomObject implements ICustomObject {
  private readonly _object: Object3D;
  private _isPartOfBoundingBox: boolean = true;
  private _shouldPick: boolean = false;
  private _shouldPickBoundingBox: boolean = false;

  /**
   * Constructor
   * @beta
   */
  constructor(object: Object3D) {
    this._object = object;
  }

  /**
   * Get the Object3D
   * @beta
   */
  get object(): Object3D {
    return this._object;
  }

  /**
   * Set or get whether it should be part of the combined bounding box or not.
   * Default is true.
   * @beta
   */
  get isPartOfBoundingBox(): boolean {
    return this._isPartOfBoundingBox;
  }

  set isPartOfBoundingBox(value: boolean) {
    this._isPartOfBoundingBox = value;
  }

  /**
   * Set or get whether it should be picked by the camera manager
   * Default is false.
   * @beta
   */
  get shouldPick(): boolean {
    return this._shouldPick;
  }

  set shouldPick(value: boolean) {
    this._shouldPick = value;
  }

  /**
   * Get the bounding box from the object
   * @beta
   */
  getBoundingBox(target: Box3): Box3 {
    target.setFromObject(this.object);
    return target;
  }

  /**
   * Set or get whether it should be also give the bounding box when picked by the camera
   * Default is false.
   * @beta
   */
  get shouldPickBoundingBox(): boolean {
    return this._shouldPickBoundingBox;
  }

  set shouldPickBoundingBox(value: boolean) {
    this._shouldPickBoundingBox = value;
  }

  /**
   * Intersect the object with the raycaster.
   * This function can be overridden to provide custom intersection logic.
   * @beta
   */
  intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const intersection = intersectInput.raycaster.intersectObject(this.object, true);
    if (intersection.length === 0) {
      return undefined;
    }
    const { point, distance } = intersection[0];
    if (closestDistance !== undefined && closestDistance < distance) {
      return undefined;
    }
    if (!intersectInput.isVisible(point)) {
      return undefined;
    }
    const customObjectIntersection: CustomObjectIntersection = {
      type: 'customObject',
      customObject: this,
      point,
      distanceToCamera: distance,
      userData: intersection[0]
    };
    if (this.shouldPickBoundingBox) {
      const boundingBox = this.getBoundingBox(new Box3());
      if (!boundingBox.isEmpty()) {
        customObjectIntersection.boundingBox = boundingBox;
      }
    }
    return customObjectIntersection;
  }

  beforeRender(_camera: PerspectiveCamera): void {}
}
