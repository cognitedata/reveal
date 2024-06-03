/*!
 * Copyright 2024 Cognite AS
 */

import { type Matrix4, Plane, Vector2, Vector3 } from 'three';

/**
 * Represents a face of a box.
 */
export class BoxFace {
  // Face is 0-5, where 0-2 are positive faces and 3-5 are negative faces
  private _face: number = 0;

  // ==================================================
  // CONTRUCTOR
  // ==================================================

  public constructor(face: number = 0) {
    this._face = face;
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get face(): number {
    return this._face;
  }

  public set face(value: number) {
    this._face = value;
  }

  public get index(): number {
    return this._face % 3; // Give 0:X axis, 1:Y-axis, 2:Z-axis
  }

  public get tangentIndex1(): number {
    return (this.index + 1) % 3; // Give 0:X axis, 1:Y-axis, 2:Z-axis
  }

  public get tangentIndex2(): number {
    return (this.index + 2) % 3; // Give 0:X axis, 1:Y-axis, 2:Z-axis
  }

  public get sign(): number {
    return this._face < 3 ? 1 : -1;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public copy(other: BoxFace): this {
    this._face = other._face;
    return this;
  }

  public equals(other: BoxFace): boolean {
    return this.face === other.face;
  }

  public fromPositionAtFace(positionAtFace: Vector3): this {
    // Assume the only on component in the positionAtEdge is set and the other are 0
    const x = Math.abs(positionAtFace.x);
    const y = Math.abs(positionAtFace.y);
    const z = Math.abs(positionAtFace.z);

    if (x >= y && x >= z) {
      this._face = positionAtFace.x > 0 ? 0 : 3;
    } else if (y >= x && y >= z) {
      this._face = positionAtFace.y > 0 ? 1 : 4;
    } else {
      this._face = positionAtFace.z > 0 ? 2 : 5;
    }
    return this;
  }

  public getPlanePoint(positionAtFace: Vector3): Vector2 {
    // Assume the only on component in the positionAtEdge is set and the other are 0
    switch (this.face) {
      case 0:
      case 3:
        return new Vector2(positionAtFace.y, positionAtFace.z);
      case 1:
      case 4:
        return new Vector2(positionAtFace.x, positionAtFace.z);
      case 2:
      case 5:
        return new Vector2(positionAtFace.x, positionAtFace.y);
      default:
        throw new Error('Invalid face');
    }
  }

  public getNormal(target?: Vector3): Vector3 {
    if (target === undefined) {
      target = new Vector3();
    }
    target.setScalar(0);
    return target.setComponent(this.index, this.sign);
  }

  public getTangent1(target?: Vector3): Vector3 {
    if (target === undefined) {
      target = new Vector3();
    }
    target.setScalar(0);
    return target.setComponent(this.tangentIndex1, 1);
  }

  public getTangent2(target?: Vector3): Vector3 {
    if (target === undefined) {
      target = new Vector3();
    }
    target.setScalar(0);
    return target.setComponent(this.tangentIndex2, 1);
  }

  public getCenter(target?: Vector3): Vector3 {
    // Assume the box is centered at (0,0,0) and has size 1 in all directions
    if (target === undefined) {
      target = new Vector3();
    }
    target.setScalar(0);
    return target.setComponent(this.index, this.sign * 0.5);
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static *getAllFaces(target?: BoxFace): Generator<BoxFace> {
    if (target === undefined) {
      target = new BoxFace();
    }
    for (target.face = 0; target.face < 6; target.face++) {
      yield target;
    }
  }

  public static createClippingPlanes(matrix: Matrix4, exceptFaceIndex?: number): Plane[] {
    const planes: Plane[] = [];

    const center = new Vector3();
    const normal = new Vector3();
    for (const boxFace of BoxFace.getAllFaces()) {
      if (exceptFaceIndex !== undefined && boxFace.index === exceptFaceIndex) {
        continue;
      }
      boxFace.getCenter(center);
      boxFace.getNormal(normal).negate();
      const plane = new Plane().setFromNormalAndCoplanarPoint(normal, center);
      plane.applyMatrix4(matrix);
      planes.push(plane);
    }
    return planes;
  }

  public static equals(face: BoxFace | undefined, other: BoxFace | undefined): boolean {
    if (face === undefined || other === undefined) {
      return true;
    }
    if (face === undefined && other !== undefined) {
      return false;
    }
    if (face !== undefined && other === undefined) {
      return false;
    }
    return face.equals(other);
  }
}
