/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3 } from 'three';

// Cache for using temporarily vectors to avoid allocations

export class Vector3Pool {
  private readonly _vectors: Vector3[];
  private _index: number = -1;

  public constructor(size = 30) {
    this._vectors = new Array(size).fill(null).map(() => new Vector3());
  }

  public getNext(copyFrom?: Vector3): Vector3 {
    // Increment the index and wrap around if it exceeds the length of the array
    this._index++;
    this._index %= this._vectors.length;
    const vector = this._vectors[this._index];
    // Return the vector at the new index
    if (copyFrom === undefined) {
      return vector;
    }
    return vector.copy(copyFrom);
  }
}
