/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3 } from 'three';

/**
 * Represents a pool of Vector3 objects that can be reused.
 * @beta
 */
export class Vector3Pool {
  private readonly _vectors: Vector3[];
  private _index: number = -1;

  /**
   * Creates a new Vector3Pool instance.
   * @beta
   * @param size The size of the pool (default: 30)
   */
  public constructor(size = 30) {
    this._vectors = new Array(size).fill(null).map(() => new Vector3());
  }

  /**
   * Gets the next available Vector3 object from the pool.
   * @beta
   * @param copyFrom An optional Vector3 object to copy the values from
   * @returns The next available Vector3 object
   */
  public getNext(copyFrom?: Vector3): Vector3 {
    // Increment the index and wrap around if it exceeds the length of the array
    this._index++;
    this._index %= this._vectors.length;
    const vector = this._vectors[this._index];
    // Return the vector at the new index
    if (copyFrom === undefined) {
      return vector.setScalar(0); // Reset the vector to zero
    }
    return vector.copy(copyFrom);
  }
}
