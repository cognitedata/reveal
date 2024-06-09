/*!
 * Copyright 2024 Cognite AS
 */

import { Plane, type Ray, Vector3 } from 'three';
import { MeasureType } from './MeasureType';
import { BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { copy } from '../../base/utilities/extensions/arrayExtensions';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';

/**
 * Helper class for generate a MeasureLineDomainObject by clicking around
 */
export class MeasureLineCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: MeasureLineDomainObject;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(measureType: MeasureType) {
    super();
    this._domainObject = new MeasureLineDomainObject(measureType);
    this._domainObject.focusType = FocusType.Pending;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get preferIntersection(): boolean {
    return true;
  }

  public override get domainObject(): DomainObject {
    return this._domainObject;
  }

  public override get minimumPointCount(): number {
    return 2;
  }

  public override get maximumPointCount(): number {
    switch (this._domainObject.measureType) {
      case MeasureType.Line:
        return 2;
      case MeasureType.Polyline:
      case MeasureType.Polygon:
        return Number.MAX_SAFE_INTEGER;
      default:
        throw new Error('Unknown measurement type');
    }
  }

  protected override addPointCore(
    ray: Ray,
    point: Vector3 | undefined,
    isPending: boolean
  ): boolean {
    // Figure out where the point should be if no intersection
    if (isPending && this.notPendingPointCount >= 1 && point === undefined) {
      const lastPoint = this.lastNotPendingPoint;
      const plane = new Plane().setFromNormalAndCoplanarPoint(ray.direction, lastPoint);
      const newPoint = ray.intersectPlane(plane, new Vector3());
      if (newPoint === null) {
        return false;
      }
      point = newPoint;
    }
    if (point === undefined) {
      return false;
    }
    this.addRawPoint(point, isPending);
    const domainObject = this._domainObject;
    copy(domainObject.points, this.points);

    domainObject.notify(Changes.geometry);
    if (this.isFinished) {
      domainObject.setSelectedInteractive(true);
      domainObject.setFocusInteractive(FocusType.Focus);
    }
    return true;
  }

  public override handleEscape(): boolean {
    const domainObject = this._domainObject;
    if (this.notPendingPointCount < this.minimumPointCount) {
      domainObject.removeInteractive();
      return false; // Removed
    } else if (this.lastIsPending) {
      domainObject.points.pop();
      this.removePendingPoint();
      domainObject.notify(Changes.geometry);
    }
    return true; // Successfully
  }
}
