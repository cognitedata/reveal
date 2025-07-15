import { type Ray, Vector3, Plane } from 'three';
import {
  type CreateDraggerProps,
  type VisualDomainObject
} from '../../../base/domainObjects/VisualDomainObject';
import { BaseDragger, EPSILON } from '../../../base/domainObjectsHelpers/BaseDragger';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type PointDomainObject } from './PointDomainObject';

export class PointDragger extends BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: PointDomainObject;
  private readonly _point: Vector3;
  private readonly _plane: Plane;
  private readonly _offset: Vector3; // Correction for picking the sphere other places than in the center

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(props: CreateDraggerProps, domainObject: PointDomainObject) {
    super(props, domainObject);
    this._domainObject = domainObject;
    this._point = this._domainObject.point.clone();
    this._plane = new Plane().setFromNormalAndCoplanarPoint(this.ray.direction, this._point);

    // This is the correction for picking at the sphere other places than in the center
    const planeIntersection = this.ray.intersectPlane(this._plane, new Vector3());
    if (planeIntersection === null) {
      throw new Error('Failed to intersect plane');
    }
    this._offset = planeIntersection.sub(this._point);
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
    if (planeIntersection.distanceTo(this._point) < EPSILON) {
      return false; // No change
    }
    if (this.transaction === undefined) {
      this.transaction = this._domainObject.createTransaction(Changes.geometry);
    }
    this._domainObject.point.copy(planeIntersection);
    this.domainObject.notify(Changes.dragging);
    return true;
  }
}
