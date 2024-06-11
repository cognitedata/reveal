/*!
 * Copyright 2024 Cognite AS
 */

import { Plane, type Ray, Vector3 } from 'three';
import { BaseDragger } from '../../base/domainObjectsHelpers/BaseDragger';
import { type PointDomainObject } from './PointDomainObject';
import {
  type VisualDomainObject,
  type CreateDraggerProps
} from '../../base/domainObjects/VisualDomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

export class PointDragger extends BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: PointDomainObject;
  private readonly _center: Vector3;
  private readonly _plane: Plane;
  private readonly _offset: Vector3; // Correction for picking the sphere other places than in the center

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(props: CreateDraggerProps, domainObject: PointDomainObject) {
    super(props);
    this._domainObject = domainObject;
    this._center = this._domainObject.center.clone();
    this._plane = new Plane().setFromNormalAndCoplanarPoint(this.ray.direction, this._center);

    // This is the correction for picking at the sphere other places than in the center
    const planeIntersection = this.ray.intersectPlane(this._plane, new Vector3());
    if (planeIntersection === null) {
      throw new Error('Failed to intersect plane');
    }
    this._offset = planeIntersection.sub(this._center);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get domainObject(): VisualDomainObject {
    return this._domainObject;
  }

  public override onPointerDrag(_event: PointerEvent, ray: Ray): boolean {
    const planeIntersection = ray.intersectPlane(this._plane, new Vector3());
    if (planeIntersection === null) {
      return false;
    }
    planeIntersection.sub(this._offset);
    if (planeIntersection.equals(this._center)) {
      return false; // No change
    }
    this._domainObject.center.copy(planeIntersection);
    this.domainObject.notify(Changes.geometry); // Tells the domain object that the geometry has been changed
    return true;
  }
}
