/*!
 * Copyright 2021 Cognite AS
 */

import { Object3D } from 'three';

/**
 * This class encasulate a Object3D, and made it possible to add flags to it.
 * It might be extended with more flags in the future.
 */
export class CustomObject {
  private readonly _object: Object3D;
  /**
   * Set or get whether it should be part of the combined bounding box or not.
   * Default is true.
   */
  isPartOfBoundingBox: boolean = true;

  /**
   * Get the Object3D
   */
  get object(): Object3D {
    return this._object;
  }

  /**
   * Constructor
   */
  constructor(object: Object3D) {
    this._object = object;
  }
}
