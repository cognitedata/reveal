/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, Vector3, Plane, type Matrix4 } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type BoxFace } from '../../../base/utilities/box/BoxFace';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type BoxPickInfo } from '../../../base/utilities/box/BoxPickInfo';
import { round, roundIncrement } from '../../../base/utilities/extensions/mathExtensions';
import { getAbsMaxComponentIndex } from '../../../base/utilities/extensions/vectorExtensions';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayExtensions';
import { CylinderDomainObject } from './CylinderDomainObject';
import { BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import {
  type VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
import { Vector3Pool } from '@cognite/reveal';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { type UnitSystem } from '../../../base/renderTarget/UnitSystem';
import { MIN_SIZE } from '../base/SolidDomainObject';

/**
 * The `BoxDragger` class represents a utility for dragging and manipulating a box in a 3D space.
 * It provides methods for scaling, translating, and rotating the box based on user interactions.
 * All geometry in this class assume Z-axis is up
 */

export class CylinderDragger extends BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: CylinderDomainObject;

  private readonly _face;
  private readonly _focusType: FocusType;
  private readonly _normal = new Vector3(); // Intersection normal
  private readonly _planeOfFace = new Plane(); // Plane of the intersection/normal
  private readonly _centerOfFace = new Vector3(); // Plane of the intersection/normal
  private readonly _cornerSign = new Vector3(); // Indicate the corner of the face
  private readonly _unitSystem: UnitSystem | undefined = undefined;

  // Original values when the drag started
  private readonly _radius;
  private readonly _height;
  private readonly _centerA = new Vector3();
  private readonly _centerB = new Vector3();

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

  public constructor(props: CreateDraggerProps, domainObject: CylinderDomainObject) {
    super(props);

    const pickInfo = props.intersection.userData as BoxPickInfo;
    this._domainObject = domainObject;
    this._face = pickInfo.face;
    this._focusType = pickInfo.focusType;
    this._cornerSign.copy(pickInfo.cornerSign);
    this._face.getNormal(this._normal);
    this._face.getCenter(this._centerOfFace);

    const rotationMatrix = this.getRotationMatrix();
    this._normal.applyMatrix4(rotationMatrix);
    this._normal.normalize();

    this._planeOfFace.setFromNormalAndCoplanarPoint(this._normal, this.point);

    const matrix = domainObject.getMatrix();
    this._centerOfFace.applyMatrix4(matrix);

    // Back up the original values
    this._radius = this._domainObject.radius;
    this._height = this._domainObject.height;
    this._centerA.copy(this._domainObject.centerA);
    this._centerB.copy(this._domainObject.centerB);

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
    const planeIntersect = ray.intersectPlane(this._planeOfFace, newVector3());
    if (planeIntersect === null) {
      return false;
    }
    const deltaCenter = planeIntersect.sub(this.point);
    if (deltaCenter.lengthSq() === 0) {
      return false;
    }
    if (shift) {
      const matrix = this.getRotationMatrix();
      const invMatrix = matrix.clone().invert();
      deltaCenter.applyMatrix4(invMatrix);
      const maxIndex = getAbsMaxComponentIndex(deltaCenter);
      for (let index = 0; index < 3; index++) {
        if (index === maxIndex) {
          continue;
        }
        deltaCenter.setComponent(index, 0);
      }
      deltaCenter.applyMatrix4(matrix);
    }
    // First copy the original values
    const { centerA, centerB } = this._domainObject;
    centerA.copy(this._centerA);
    centerB.copy(this._centerB);

    // Then translate the center
    centerA.add(deltaCenter);
    centerB.add(deltaCenter);
    return true;
  }

  private moveFace(ray: Ray, shift: boolean): boolean {
    // Take find closest point between the ray and the line perpendicular to the face of in picked box.
    // The distance from this point to the face of in picked box is the change.
    const pointOnSegment = newVector3();
    getClosestPointOnLine(ray, this._normal, this.point, pointOnSegment);
    const deltaHeight = this._planeOfFace.distanceToPoint(pointOnSegment);
    if (deltaHeight === 0) {
      return false; // Nothing has changed
    }
    if (this._face.face === 5 || this._face.face === 2) {
      let newHeight = this._height + deltaHeight;

      if (!CylinderDomainObject.isValidSize(newHeight)) {
        newHeight = MIN_SIZE;
      }
      if (shift && this._unitSystem !== undefined) {
        const newConvertedHeight = this._unitSystem.convertToUnit(newHeight, Quantity.Length);
        // Divide the box into abound some parts and use that as the increment
        const increment = roundIncrement(newConvertedHeight / 25);
        const roundedNewHeight = round(newConvertedHeight, increment);
        newHeight = this._unitSystem.convertFromUnit(roundedNewHeight, Quantity.Length);
        if (!CylinderDomainObject.isValidSize(newHeight)) {
          newHeight = MIN_SIZE;
        }
      }
      if (newHeight === this._height) {
        return false; // Nothing has changed
      }
      const { centerA, centerB } = this._domainObject;
      centerA.copy(this._centerA);
      centerB.copy(this._centerB);

      const axis = newVector3().subVectors(centerA, centerB).normalize().multiplyScalar(newHeight);
      if (this._face.face === 2) {
        centerB.subVectors(centerA, axis);
      } else {
        centerA.addVectors(centerB, axis);
      }
      return true;
    }
    return false;
  }

  private rotate(ray: Ray, _shift: boolean): boolean {
    const endPoint = ray.intersectPlane(this._planeOfFace, newVector3());
    if (endPoint === null) {
      return false;
    }
    // Move end point to the same plane as the center of the end point,
    // and adjust the length so it doesn't change
    if (this._face.face === 5 || this._face.face === 2) {
      const translation = newVector3().subVectors(endPoint, this.point);
      const { centerA, centerB } = this._domainObject;
      centerA.copy(this._centerA);
      centerB.copy(this._centerB);

      if (this._face.face === 2) {
        centerB.add(translation);
        const axis = newVector3()
          .subVectors(centerA, centerB)
          .normalize()
          .multiplyScalar(this._height);
        centerB.subVectors(centerA, axis);
      } else {
        centerA.add(translation);
        const axis = newVector3()
          .subVectors(centerA, centerB)
          .normalize()
          .multiplyScalar(this._height);
        centerA.addVectors(centerB, axis);
      }
      return true;
    }
    return false;
  }

  public getRotationMatrix(): Matrix4 {
    return this._domainObject.getRotationMatrix();
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
