/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3 } from 'three';

export class BoxFace {
  // Face is 0-5, where 0-2 are positive faces and 3-5 are negative faces
  private _face: number = 0;

  public constructor(face: number = 0) {
    this._face = face;
  }

  public get index(): number {
    return this._face % 3;
  }

  public get face(): number {
    return this._face;
  }

  public get tangentIndex1(): number {
    return (this.index + 1) % 3;
  }

  public get tangentIndex2(): number {
    return (this.index + 2) % 3;
  }

  public get sign(): number {
    return this._face < 3 ? 1 : -1;
  }

  copy(other: BoxFace): this {
    this._face = other._face;
    return this;
  }

  public fromPositionAtEdge(positionAtEdge: Vector3): this {
    const x = Math.abs(positionAtEdge.x);
    const y = Math.abs(positionAtEdge.y);
    const z = Math.abs(positionAtEdge.z);

    if (x >= y && x >= z) {
      this._face = positionAtEdge.x > 0 ? 0 : 3;
    } else if (y >= x && y >= z) {
      this._face = positionAtEdge.y > 0 ? 1 : 4;
    } else {
      this._face = positionAtEdge.z > 0 ? 2 : 5;
    }
    return this;
  }

  public getNormal(): Vector3 {
    return new Vector3().setComponent(this.index, this.sign);
  }

  public getTangent1(): Vector3 {
    return new Vector3().setComponent(this.tangentIndex1, 1);
  }

  public getTangent2(): Vector3 {
    return new Vector3().setComponent(this.tangentIndex2, 1);
  }

  public getCenter(): Vector3 {
    // Assume the box is centered at (0,0,0) and has size 1 in all directions
    return this.getNormal().multiplyScalar(0.5);
  }
}
