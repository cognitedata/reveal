/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, Vector3, Plane, Matrix4 } from 'three';
import { Changes } from '../../domainObjectsHelpers/Changes';
import { type BoxFace } from './BoxFace';
import { BoxFocusType } from './BoxFocusType';
import { type DomainObject } from '../../domainObjects/DomainObject';
import { type IBox } from './IBox';
import { type BoxPickInfo } from './BoxPickInfo';
import { forceBetween0AndPi } from '../extensions/mathExtensions';
import { horizontalAngle } from '../extensions/vectorExtensions';
import { Vector3Pool } from '../geometry/Vector3Pool';

/**
 * The `BoxDragger` class represents a utility for dragging and manipulating a box in a 3D space.
 * It provides methods for scaling, translating, and rotating the box based on user interactions.
 * All geometry in this class assume Z-axis is up
 */
export class BoxDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly domainObject: DomainObject;
  private readonly _box: IBox;

  private readonly _face;
  private readonly _focusType: BoxFocusType;
  private readonly _point: Vector3 = new Vector3(); // Intersection point
  private readonly _normal: Vector3 = new Vector3(); // Intersection normal
  private readonly _planeOfBox: Plane = new Plane(); // Plane of the intersection/normal
  private readonly _minPoint: Vector3 = new Vector3(); // Start of line from point at -normal direction
  private readonly _maxPoint: Vector3 = new Vector3(); // End of line from point at +normal direction

  // Original values when the drag started
  private readonly _sizeOfBox: Vector3 = new Vector3();
  private readonly _centerOfBox: Vector3 = new Vector3();
  private readonly _zRotationOfBox: number = 0;

  private readonly _cornerSign = new Vector3(); // Indicate the corner of the face

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get face(): BoxFace {
    return this._face;
  }

  public get focusType(): BoxFocusType {
    return this._focusType;
  }

  // ==================================================
  // CONTRUCTOR
  // ==================================================

  public constructor(domainObject: DomainObject, point: Vector3, pickInfo: BoxPickInfo) {
    this.domainObject = domainObject;
    this._box = domainObject as unknown as IBox;
    this._face = pickInfo.face;
    this._focusType = pickInfo.focusType;
    this._cornerSign.copy(pickInfo.cornerSign);
    this._point.copy(point);
    this._face.getNormal(this._normal);

    const rotationMatrix = this.getRotationMatrix();
    this._normal.applyMatrix4(rotationMatrix);
    this._normal.normalize();

    const length = this._box.size.length() * 100 + 100;
    this._minPoint.copy(point);
    this._maxPoint.copy(point);
    this._minPoint.addScaledVector(this._normal, +length);
    this._maxPoint.addScaledVector(this._normal, -length);

    this._planeOfBox.setFromNormalAndCoplanarPoint(this._normal, point);

    // Back up the original values
    this._sizeOfBox.copy(this._box.size);
    this._centerOfBox.copy(this._box.center);
    this._zRotationOfBox = this._box.zRotation;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public apply(ray: Ray): boolean {
    if (!this.applyByFocusType(this.focusType, ray)) {
      return false;
    }
    this.domainObject.notify(Changes.geometry);
    return true;
  }

  private applyByFocusType(type: BoxFocusType, ray: Ray): boolean {
    switch (type) {
      case BoxFocusType.ResizeByEdge:
        return this.resizeByEdge(ray);
      case BoxFocusType.ResizeByCorner:
        return this.resizeByCorner(ray);
      case BoxFocusType.Translate:
        return this.translate(ray);
      case BoxFocusType.Rotate:
        return this.rotate(ray);
      default:
        return false;
    }
  }

  private translate(ray: Ray): boolean {
    const planeIntersect = ray.intersectPlane(this._planeOfBox, newVector3());
    if (planeIntersect === null) {
      return false;
    }
    const deltaCenter = planeIntersect.sub(this._point);
    if (deltaCenter.lengthSq() === 0) {
      return false;
    }
    // First copy the original values
    const { center } = this._box;
    center.copy(this._centerOfBox);

    // Then translate the center
    center.add(deltaCenter);
    return true;
  }

  private resizeByEdge(ray: Ray): boolean {
    // Take find closest point between the ray and the line perpenducular to the face of in picked box.
    // The distance from this point to the face of in picked box is the change.
    const pointOnSegment = newVector3();
    ray.distanceSqToSegment(this._minPoint, this._maxPoint, undefined, pointOnSegment);
    const deltaSize = this._planeOfBox.distanceToPoint(pointOnSegment);
    if (deltaSize === 0) {
      return false; // Nothing has changed
    }
    // First copy the original values
    const { size, center } = this._box;
    size.copy(this._sizeOfBox);
    center.copy(this._centerOfBox);

    // Apply the change
    const index = this._face.index;
    size.setComponent(index, deltaSize + size.getComponent(index));
    this._box.forceMinSize();

    if (size.getComponent(index) === this._sizeOfBox.getComponent(index)) {
      return false; // Nothing has changed
    }
    // The center of the box should be moved by half of the delta size and take the rotation into accont.
    const newDeltaSize = size.getComponent(index) - this._sizeOfBox.getComponent(index);
    const deltaCenter = (this._face.sign * newDeltaSize) / 2;
    const deltaCenterVector = newVector3();
    deltaCenterVector.setComponent(index, deltaCenter);
    const rotationMatrix = this.getRotationMatrix();
    deltaCenterVector.applyMatrix4(rotationMatrix);
    center.add(deltaCenterVector);
    return true;
  }

  private resizeByCorner(ray: Ray): boolean {
    const endPoint = ray.intersectPlane(this._planeOfBox, newVector3());
    if (endPoint === null) {
      return false;
    }
    const startPoint = this._planeOfBox.projectPoint(this._point, newVector3());

    const rotationMatrix = this.getRotationMatrix();
    const invRotationMatrix = rotationMatrix.clone().invert();
    const deltaSize = endPoint.sub(startPoint);
    deltaSize.applyMatrix4(invRotationMatrix);

    deltaSize.multiply(this._cornerSign);
    if (deltaSize.lengthSq() === 0) {
      return false; // Nothing has changed
    }
    // First copy the original values
    const { size, center } = this._box;
    size.copy(this._sizeOfBox);
    center.copy(this._centerOfBox);

    // Apply the change
    size.add(deltaSize);
    this._box.forceMinSize();

    if (size.lengthSq() === this._sizeOfBox.lengthSq()) {
      return false; // Nothing has changed
    }
    // The center of the box should be moved by half of the delta size and take the rotation into accont.
    const newDeltaSize = newVector3().subVectors(size, this._sizeOfBox);
    const deltaCenter = newDeltaSize.divideScalar(2);
    deltaCenter.multiply(this._cornerSign);
    deltaCenter.applyMatrix4(rotationMatrix);
    center.add(deltaCenter);
    return true;
  }

  private rotate(ray: Ray): boolean {
    const endPoint = ray.intersectPlane(this._planeOfBox, newVector3());
    if (endPoint === null) {
      return false;
    }
    const center = this._planeOfBox.projectPoint(this._centerOfBox, newVector3());
    const centerToStartPoint = newVector3().subVectors(this._point, center);
    const centerToEndPoint = newVector3().subVectors(endPoint, center);

    // Ignore Z-value since we are only interested in the rotation around the Z-axis
    const deltaAngle = horizontalAngle(centerToEndPoint) - horizontalAngle(centerToStartPoint);

    // Rotate
    this._box.zRotation = forceBetween0AndPi(deltaAngle + this._zRotationOfBox);
    return true;
  }

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.makeRotationZ(this._box.zRotation);
    return matrix;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
