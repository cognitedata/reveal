/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, Vector3, Plane, Line3 } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type BoxFace } from '../common/BoxFace';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayExtensions';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import {
  type VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
import { Vector3Pool } from '@cognite/reveal';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';

/**
 * The `CylinderDragger` class represents a utility for dragging and manipulating a cylinder in a 3D space.
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

  // Original cylinder when the drag started
  private readonly _originalCylinder = new Cylinder();

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
    super(props, domainObject);

    const pickInfo = props.intersection.userData as PrimitivePickInfo;
    this._domainObject = domainObject;
    this._face = pickInfo.face;
    this._focusType = pickInfo.focusType;

    if (this._face.index === 2) {
      this._face.getNormal(this._normal);
      const rotationMatrix = domainObject.cylinder.getRotationMatrix();
      this._normal.applyMatrix4(rotationMatrix);
      this._normal.normalize();
      this._planeOfFace.setFromNormalAndCoplanarPoint(this._normal, this.point);
    }
    // Back up the original cylinder
    this._originalCylinder.copy(domainObject.cylinder);
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
    this.domainObject.notify(Changes.dragging);
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private applyByFocusType(focusType: FocusType, ray: Ray, isShiftPressed: boolean): boolean {
    switch (focusType) {
      case FocusType.Face:
        return this.moveFace(ray, isShiftPressed);
      case FocusType.Body:
        return this.translate(ray);
      case FocusType.Rotation:
        return this.rotate(ray);
      default:
        return false;
    }
  }

  private translate(ray: Ray): boolean {
    // This translation can only be done in one plane, so we need to find the intersection point
    if (this._face.index !== 2) {
      return false;
    }
    const planeIntersect = ray.intersectPlane(this._planeOfFace, newVector3());
    if (planeIntersect === null) {
      return false;
    }
    const deltaCenter = planeIntersect.sub(this.point);
    if (deltaCenter.lengthSq() === 0) {
      return false;
    }
    // First copy the original values
    const { cylinder } = this._domainObject;
    const originalCylinder = this._originalCylinder;
    cylinder.copy(originalCylinder);

    // Then translate the center
    cylinder.centerA.add(deltaCenter);
    cylinder.centerB.add(deltaCenter);
    return true;
  }

  private moveFace(ray: Ray, isShiftPressed: boolean): boolean {
    if (this._face.index !== 2) {
      return this.moveRadius(ray, isShiftPressed);
    } else {
      return this.moveEndCaps(ray, isShiftPressed);
    }
  }

  private moveRadius(ray: Ray, isShiftPressed: boolean): boolean {
    // Change radius
    const { cylinder } = this._domainObject;
    const axis = new Line3(cylinder.centerA, cylinder.centerB);
    const closestOnAxis = axis.closestPointToPoint(this.point, true, newVector3());
    const axisNormal = newVector3().subVectors(closestOnAxis, this.point).normalize();

    const closestToRay = getClosestPointOnLine(ray, axisNormal, closestOnAxis);

    const radius = closestToRay.distanceTo(closestOnAxis);
    const newRadius = this.getBestValue(radius, isShiftPressed, Cylinder.MinSize);
    if (newRadius === cylinder.radius) {
      return false; // Nothing has changed
    }
    cylinder.radius = newRadius;
    return true;
  }

  private moveEndCaps(ray: Ray, isShiftPressed: boolean): boolean {
    // Take find closest point between the ray and the line perpendicular to the end face.
    // The distance from this point to the face is the change.
    const pointOnSegment = newVector3();
    getClosestPointOnLine(ray, this._normal, this.point, pointOnSegment);
    const deltaHeight = this._planeOfFace.distanceToPoint(pointOnSegment);
    if (deltaHeight === 0) {
      return false; // Nothing has changed
    }
    const originalCylinder = this._originalCylinder;
    const newHeight = this.getBestValue(
      originalCylinder.height + deltaHeight,
      isShiftPressed,
      Cylinder.MinSize
    );
    if (newHeight === originalCylinder.height) {
      return false; // Nothing has changed
    }
    const { cylinder } = this._domainObject;
    cylinder.copy(originalCylinder);
    const { centerA, centerB } = cylinder;

    const axis = newVector3().subVectors(centerA, centerB).normalize().multiplyScalar(newHeight);
    if (this._face.face === 2) {
      centerB.subVectors(centerA, axis);
    } else {
      centerA.addVectors(centerB, axis);
    }
    return true;
  }

  private rotate(ray: Ray): boolean {
    if (this._face.index !== 2) {
      return false;
    }
    const endPoint = ray.intersectPlane(this._planeOfFace, newVector3());
    if (endPoint === null) {
      return false;
    }
    // Move end point to the same plane as the center of the end point,
    // and adjust the length so it doesn't change
    const translation = newVector3().subVectors(endPoint, this.point);
    const { cylinder } = this._domainObject;
    const originalCylinder = this._originalCylinder;
    cylinder.copy(originalCylinder);
    const { centerA, centerB } = cylinder;

    if (this._face.face === 2) {
      centerB.add(translation);
      const axis = newVector3()
        .subVectors(centerA, centerB)
        .normalize()
        .multiplyScalar(originalCylinder.height);
      centerB.subVectors(centerA, axis);
    } else {
      centerA.add(translation);
      const axis = newVector3()
        .subVectors(centerA, centerB)
        .normalize()
        .multiplyScalar(originalCylinder.height);
      centerA.addVectors(centerB, axis);
    }
    return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
