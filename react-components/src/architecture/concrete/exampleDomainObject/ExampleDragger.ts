/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, Vector3, Plane } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type ExampleDomainObject } from './ExampleDomainObject';
import { BaseDragger } from '../../base/domainObjectsHelpers/BaseDragger';
import { type CreateDraggerProps } from '../../base/domainObjects/VisualDomainObject';

export class ExampleDragger extends BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: ExampleDomainObject;
  private readonly _center: Vector3;
  private readonly _plane: Plane;

  // ==================================================
  // CONTRUCTOR
  // ==================================================

  public constructor(props: CreateDraggerProps, domainObject: ExampleDomainObject) {
    super(props);
    this._domainObject = domainObject;
    this._center = this._domainObject.center.clone();
    this._plane = new Plane().setFromNormalAndCoplanarPoint(this.ray.direction, this._center);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get domainObject(): DomainObject {
    return this._domainObject;
  }

  public override onPointerDrag(_event: PointerEvent, ray: Ray): boolean {
    const planeIntersect = ray.intersectPlane(this._plane, new Vector3());
    if (planeIntersect === null) {
      return false;
    }
    this._domainObject.center.copy(planeIntersect);
    this.domainObject.notify(Changes.geometry);
    return true;
  }
}
