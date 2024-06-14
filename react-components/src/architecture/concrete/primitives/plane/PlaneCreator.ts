/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, Vector3 } from 'three';
import { PrimitiveType } from '../PrimitiveType';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type PlaneDomainObject } from './PlaneDomainObject';
import { rotatePiHalf } from '../../../base/utilities/extensions/vectorExtensions';

/**
 * Helper class for generate a PlaneDomainObject by clicking around
 */
export class PlaneCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: PlaneDomainObject;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(domainObject: PlaneDomainObject) {
    super();
    this._domainObject = domainObject;
    this._domainObject.focusType = FocusType.Pending;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get domainObject(): DomainObject {
    return this._domainObject;
  }

  public override get preferIntersection(): boolean {
    return true;
  }

  public override get minimumPointCount(): number {
    return this.maximumPointCount;
  }

  public override get maximumPointCount(): number {
    switch (this._domainObject.primitiveType) {
      case PrimitiveType.XPlane:
      case PrimitiveType.YPlane:
      case PrimitiveType.ZPlane:
        return 1;
      case PrimitiveType.XYPlane:
        return 2;
      default:
        throw new Error('Unknown primitiveType');
    }
  }

  protected override addPointCore(
    ray: Ray,
    point: Vector3 | undefined,
    isPending: boolean
  ): boolean {
    if (point === undefined) {
      return false;
    }
    const domainObject = this._domainObject;
    this.addRawPoint(point, isPending);
    if (!this.rebuild(ray)) {
      return false;
    }
    domainObject.notify(Changes.geometry);
    if (this.isFinished) {
      domainObject.setSelectedInteractive(true);
      domainObject.setFocusInteractive(FocusType.Focus);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private rebuild(ray: Ray): boolean {
    if (this.pointCount === 0) {
      throw new Error('Cannot create a plane without points');
    }
    const domainObject = this._domainObject;
    switch (domainObject.primitiveType) {
      case PrimitiveType.XPlane:
        domainObject.plane.setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), this.firstPoint);
        break;

      case PrimitiveType.YPlane:
        domainObject.plane.setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0), this.firstPoint);
        break;

      case PrimitiveType.ZPlane:
        domainObject.plane.setFromNormalAndCoplanarPoint(new Vector3(0, 0, 1), this.firstPoint);
        break;

      case PrimitiveType.XYPlane:
        if (this.pointCount === 1) {
          const normal = ray.direction.clone().normalize();
          domainObject.plane.setFromNormalAndCoplanarPoint(normal, this.firstPoint);
        } else if (this.pointCount === 2) {
          const normal = new Vector3().subVectors(this.lastPoint, this.firstPoint).normalize();
          rotatePiHalf(normal);
          domainObject.plane.setFromNormalAndCoplanarPoint(normal, this.firstPoint);
        }
        break;
    }
    return true;
  }
}
