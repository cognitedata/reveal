/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3 } from 'three';

// Cache for using temporarily vectors to avoid allocations

export class ReusableVector3s {
  private readonly _vectors: Array<Vector3>;
  private _index: number = -1;

  public constructor(size = 30) {
    this._vectors = new Array(size).fill(null).map(() => new Vector3());
  }

  public getNext(): Vector3 {
    // Increment the index and wrap around if it exceeds the length of the array
    this._index++;
    this._index %= this._vectors.length;
    // Return the vector at the new index
    return this._vectors[this._index];
  }
}
