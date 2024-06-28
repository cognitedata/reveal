/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, Vector3, Plane, Matrix4 } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type BoxFace } from '../../../base/utilities/box/BoxFace';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type BoxPickInfo } from '../../../base/utilities/box/BoxPickInfo';
import {
  forceBetween0AndPi,
  round,
  roundIncrement
} from '../../../base/utilities/extensions/mathExtensions';
import {
  getAbsMaxComponentIndex,
  horizontalAngle,
  rotateHorizontal
} from '../../../base/utilities/extensions/vectorExtensions';
import { PrimitiveType } from '../PrimitiveType';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayExtensions';
import { BoxDomainObject } from './BoxDomainObject';
import { BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import {
  type VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
import { Vector3Pool } from '@cognite/reveal';
import { degToRad, radToDeg } from 'three/src/math/MathUtils.js';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { type UnitSystem } from '../../../base/renderTarget/UnitSystem';

const CONSTRAINED_ANGLE_INCREMENT = 15;
/**
 * The `BoxDragger` class represents a utility for dragging and manipulating a box in a 3D space.
 * It provides methods for scaling, translating, and rotating the box based on user interactions.
 * All geometry in this class assume Z-axis is up
 */

export class BoxDragger extends BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: BoxDomainObject;

  private readonly _face;
  private readonly _focusType: FocusType;
  private readonly _normal: Vector3 = new Vector3(); // Intersection normal
  private readonly _planeOfBox: Plane = new Plane(); // Plane of the intersection/normal

  // Original values when the drag started
  private readonly _sizeOfBox: Vector3 = new Vector3();
  private readonly _centerOfBox: Vector3 = new Vector3();
  private readonly _zRotationOfBox: number = 0;

  private readonly _cornerSign = new Vector3(); // Indicate the corner of the face
  private readonly _unitSystem: UnitSystem | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get face(): BoxFace {
    return this._face;
  }

  public get focusType(): FocusType {
    return this._focusType;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(props: CreateDraggerProps, domainObject: BoxDomainObject) {
    super(props);

    const pickInfo = props.intersection.userData as BoxPickInfo;
    this._domainObject = domainObject;
    this._face = pickInfo.face;
    this._focusType = pickInfo.focusType;
    this._cornerSign.copy(pickInfo.cornerSign);
    this._face.getNormal(this._normal);

    const rotationMatrix = this.getRotationMatrix();
    this._normal.applyMatrix4(rotationMatrix);
    this._normal.normalize();

    this._planeOfBox.setFromNormalAndCoplanarPoint(this._normal, this.point);

    // Back up the original values
    this._sizeOfBox.copy(this._domainObject.size);
    this._centerOfBox.copy(this._domainObject.center);
    this._zRotationOfBox = this._domainObject.zRotation;

    const root = this._domainObject.rootDomainObject;
    if (root !== undefined) {
      this._unitSystem = root.unitSystem;
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get domainObject(): VisualDomainObject {
    return this._domainObject;
  }

  public override onPointerDown(_event: PointerEvent): void {
    this._domainObject.setFocusInteractive(this.focusType, this.face);
  }

  public override onPointerDrag(event: PointerEvent, ray: Ray): boolean {
    if (this.transaction === undefined) {
      this.transaction = this._domainObject.createTransaction(Changes.geometry);
    }
    if (!this.applyByFocusType(this.focusType, ray, event.shiftKey)) {
      return false;
    }
    this.domainObject.notify(Changes.geometry);
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private applyByFocusType(focusType: FocusType, ray: Ray, shift: boolean): boolean {
    switch (focusType) {
      case FocusType.Face:
        return this.moveFace(ray, shift);
      case FocusType.Corner:
        return this.resize(ray);
      case FocusType.Body:
        return this.translate(ray, shift);
      case FocusType.Rotation:
        return this.rotate(ray, shift);
      default:
        return false;
    }
  }

  private translate(ray: Ray, shift: boolean): boolean {
    // This translation can only be done in one plane, so we need to find the intersection point
    const planeIntersect = ray.intersectPlane(this._planeOfBox, newVector3());
    if (planeIntersect === null) {
      return false;
    }
    const deltaCenter = planeIntersect.sub(this.point);
    if (deltaCenter.lengthSq() === 0) {
      return false;
    }
    if (shift) {
      rotateHorizontal(deltaCenter, -this._domainObject.zRotation);
      const maxIndex = getAbsMaxComponentIndex(deltaCenter);
      for (let index = 0; index < 3; index++) {
        if (index === maxIndex) {
          continue;
        }
        deltaCenter.setComponent(index, 0);
      }
      rotateHorizontal(deltaCenter, this._domainObject.zRotation);
    }
    // First copy the original values
    const { center } = this._domainObject;
    center.copy(this._centerOfBox);

    // Then translate the center
    center.add(deltaCenter);
    return true;
  }

  private moveFace(ray: Ray, shift: boolean): boolean {
    // Take find closest point between the ray and the line perpendicular to the face of in picked box.
    // The distance from this point to the face of in picked box is the change.
    const pointOnSegment = newVector3();

    getClosestPointOnLine(ray, this._normal, this.point, pointOnSegment);
    const deltaSize = this._planeOfBox.distanceToPoint(pointOnSegment);
    if (deltaSize === 0) {
      return false; // Nothing has changed
    }
    // First copy the original values
    const { size, center } = this._domainObject;
    size.copy(this._sizeOfBox);
    center.copy(this._centerOfBox);

    const index = this._face.index;
    let deltaCenter: number;
    if (this._domainObject.primitiveType !== PrimitiveType.Box) {
      deltaCenter = this._face.sign * deltaSize;
    } else {
      // Set new size
      size.setComponent(index, deltaSize + size.getComponent(index));
      this._domainObject.forceMinSize();

      if (
        shift &&
        this._unitSystem !== undefined &&
        BoxDomainObject.isValidSize(size.getComponent(index))
      ) {
        const newSize = this._unitSystem.convertToUnit(size.getComponent(index), Quantity.Length);
        // Divide the box into abound some parts and use that as the increment
        const increment = roundIncrement(newSize / 25);
        let roundedNewSize = round(newSize, increment);
        roundedNewSize = this._unitSystem.convertFromUnit(roundedNewSize, Quantity.Length);
        size.setComponent(index, roundedNewSize);
      }
      if (size.getComponent(index) === this._sizeOfBox.getComponent(index)) {
        return false; // Nothing has changed
      }
      // The center of the box should be moved by half of the delta size and take the rotation into account.
      const newDeltaSize = size.getComponent(index) - this._sizeOfBox.getComponent(index);
      deltaCenter = (this._face.sign * newDeltaSize) / 2;
    }
    // Set new center
    const deltaCenterVector = newVector3();
    deltaCenterVector.setComponent(index, deltaCenter);
    const rotationMatrix = this.getRotationMatrix();
    deltaCenterVector.applyMatrix4(rotationMatrix);
    center.add(deltaCenterVector);
    return true;
  }

  private resize(ray: Ray): boolean {
    const endPoint = ray.intersectPlane(this._planeOfBox, newVector3());
    if (endPoint === null) {
      return false;
    }
    const startPoint = this._planeOfBox.projectPoint(this.point, newVector3());

    const rotationMatrix = this.getRotationMatrix();
    const invRotationMatrix = rotationMatrix.clone().invert();
    const deltaSize = endPoint.sub(startPoint);
    deltaSize.applyMatrix4(invRotationMatrix);

    deltaSize.multiply(this._cornerSign);
    if (deltaSize.lengthSq() === 0) {
      return false; // Nothing has changed
    }
    // First copy the original values
    const { size, center } = this._domainObject;
    size.copy(this._sizeOfBox);
    center.copy(this._centerOfBox);

    // Apply the change
    size.add(deltaSize);
    this._domainObject.forceMinSize();

    if (size.lengthSq() === this._sizeOfBox.lengthSq()) {
      return false; // Nothing has changed
    }
    // The center of the box should be moved by half of the delta size and take the rotation into account.
    const newDeltaSize = newVector3().subVectors(size, this._sizeOfBox);
    const deltaCenter = newDeltaSize.divideScalar(2);
    deltaCenter.multiply(this._cornerSign);
    deltaCenter.applyMatrix4(rotationMatrix);
    center.add(deltaCenter);
    return true;
  }

  private rotate(ray: Ray, shift: boolean): boolean {
    const endPoint = ray.intersectPlane(this._planeOfBox, newVector3());
    if (endPoint === null) {
      return false;
    }
    const center = this._planeOfBox.projectPoint(this._centerOfBox, newVector3());
    const centerToStartPoint = newVector3().subVectors(this.point, center);
    const centerToEndPoint = newVector3().subVectors(endPoint, center);

    // Ignore Z-value since we are only interested in the rotation around the Z-axis
    const deltaAngle = horizontalAngle(centerToEndPoint) - horizontalAngle(centerToStartPoint);

    // Rotate
    let zRotation = forceBetween0AndPi(deltaAngle + this._zRotationOfBox);
    if (shift) {
      let degrees = radToDeg(zRotation);
      degrees = round(degrees, CONSTRAINED_ANGLE_INCREMENT);
      zRotation = degToRad(degrees);
    }
    this._domainObject.zRotation = zRotation;
    return true;
  }

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.makeRotationZ(this._domainObject.zRotation);
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
