import { type Matrix4, Plane, Vector2, Vector3 } from 'three';

/**
 * Represents a face of a box.
 */
export class BoxFace {
  // Face is 0-5, where 0-2 are positive faces and 3-5 are negative faces
  private _face = 0;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(face: number = 0) {
    if (face < 0 || face > 5) {
      throw new Error('Invalid face ' + face);
    }
    this._face = face;
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get face(): number {
    return this._face;
  }

  public set face(value: number) {
    if (value < 0 || value > 5) {
      throw new Error('Invalid face ' + value);
    }
    this._face = value;
  }

  /**
   * Gets the axis index corresponding to this face.
   * @returns The axis index (0 for X, 1 for Y, 2 for Z).
   */
  public get index(): number {
    return this._face % 3;
  }

  /**
   * Gets the tangent index 1 corresponding to this face.
   * @returns The axis index (0 for X, 1 for Y, 2 for Z).
   */
  public get tangentIndex1(): number {
    return (this.index + 1) % 3;
  }

  /**
   * Gets the tangent index 2 corresponding to this face.
   * @returns The axis index (0 for X, 1 for Y, 2 for Z).
   */
  public get tangentIndex2(): number {
    return (this.index + 2) % 3;
  }

  /**
   * Gets the sign of the face.
   * Returns `1` if the face index is less than 3, otherwise returns `-1`.
   * This can be used to determine the orientation of the box face.
   */
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
      case 1:
      case 4:
        return new Vector2(positionAtFace.x, positionAtFace.z);
      case 2:
      case 5:
        return new Vector2(positionAtFace.x, positionAtFace.y);
      default:
        return new Vector2(positionAtFace.y, positionAtFace.z);
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
    for (let face = 0; face < 6; face++) {
      target.face = face;
      yield target;
    }
  }

  public static createClippingPlanes(matrix: Matrix4, exceptIndex?: number): Plane[] {
    const planes: Plane[] = [];

    const center = new Vector3();
    const normal = new Vector3();
    for (const boxFace of BoxFace.getAllFaces()) {
      if (exceptIndex !== undefined && boxFace.index === exceptIndex) {
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
    if (face === undefined) {
      return other === undefined;
    }
    if (other === undefined) {
      return false;
    }
    return face.equals(other);
  }
}
