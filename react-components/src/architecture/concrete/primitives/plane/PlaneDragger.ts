/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, Plane } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type PlaneDomainObject } from './PlaneDomainObject';
import { BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import {
  type VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayExtensions';

/**
 * The `PlaneDragger` class represents a utility for dragging and manipulating a plane in a 3D space.
 * All geometry in this class assume Z-axis is up
 */
export class PlaneDragger extends BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: PlaneDomainObject;
  private readonly _plane: Plane;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(props: CreateDraggerProps, domainObject: PlaneDomainObject) {
    super(props);

    this._domainObject = domainObject;
    this._plane = this._domainObject.plane.clone();
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get domainObject(): VisualDomainObject {
    return this._domainObject;
  }

  public override onPointerDown(_event: PointerEvent): void {
    this._domainObject.setFocusInteractive(FocusType.Focus);
  }

  public override onPointerDrag(_event: PointerEvent, ray: Ray): boolean {
    const newPoint = getClosestPointOnLine(ray, this._plane.normal, this.point);
    const newPlane = new Plane().setFromNormalAndCoplanarPoint(this._plane.normal, newPoint);
    this._domainObject.plane.copy(newPlane);
    this.domainObject.notify(Changes.geometry);
    return true;
  }
}
