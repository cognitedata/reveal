/*!
 * Copyright 2024 Cognite AS
 */

import { Object3D, Box3, PerspectiveCamera } from 'three';
import { CustomObjectIntersection } from './CustomObjectIntersection';
import { CustomObjectIntersectInput } from './CustomObjectIntersectInput';

/**
 * This interface encasulate a Object3D, and made it possible to add flags to it.
 * It might be extended with more flags in the future.
 * @beta
 */
export interface ICustomObject {
  /**
   * Get the Object3D
   * @beta
   */
  get object(): Object3D;

  /**
   * Get whether it should be part of the combined bounding box or not.
   * Default is true.
   * @beta
   */
  get isPartOfBoundingBox(): boolean;

  /**
   * Get whether it should be picked by the camera manager
   * Default is false.
   * @beta
   */
  get shouldPick(): boolean;

  /**
   * Set or get whether it should be also give the bounding box when picked by the camera
   * Default is false.
   * @beta
   */
  get shouldPickBoundingBox(): boolean;

  /**
   * Get the bounding box from the object
   * @beta
   */
  getBoundingBox(target: Box3): Box3;

  /**
   * Intersect the object with the raycaster.
   * This function can be overridden to provide custom intersection logic.
   * @beta
   */
  intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection;

  /**
   * This method is called before rendering of the custom object
   * @beta
   */
  beforeRender(camera: PerspectiveCamera): void;
}
