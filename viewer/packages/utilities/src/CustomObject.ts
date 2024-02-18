/*!
 * Copyright 2021 Cognite AS
 */

import { Object3D } from 'three';

/**
 * This class encasulate a Object3D, and made it possible to add flags to it.
 * It might be extended with more flags in the future.
 * @beta
 */
export class CustomObject {
  private readonly _object: Object3D;

  /**
   * Set or get whether it should be part of the combined bounding box or not.
   * Default is true.
   * @beta
   */
  isPartOfBoundingBox: boolean = true;

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
}
