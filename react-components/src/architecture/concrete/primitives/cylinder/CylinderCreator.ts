/*!
 * Copyright 2024 Cognite AS
 */

import { Plane, type Ray, Vector3 } from 'three';
import { type PrimitiveType } from '../common/PrimitiveType';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type BaseTool } from '../../../base/commands/BaseTool';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { MIN_SIZE } from '../common/SolidDomainObject';

const UP_VECTOR = new Vector3(0, 0, 1);
/**
 * Helper class for generate a CylinderDomainObject by clicking around
 */
export class CylinderCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: CylinderDomainObject;
  private readonly _isHorizontal;
  private _radius = MIN_SIZE;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(tool: BaseTool, domainObject: CylinderDomainObject, isHorizontal: boolean) {
    super(tool);
    this._domainObject = domainObject;
    this._domainObject.focusType = FocusType.Pending;
    this._isHorizontal = isHorizontal;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get domainObject(): DomainObject {
    return this._domainObject;
  }

  public override get minimumPointCount(): number {
    return this.maximumPointCount;
  }

  public override get maximumPointCount(): number {
    return 3;
  }

  protected override addPointCore(
    ray: Ray,
    point: Vector3 | undefined,
    isPending: boolean
  ): boolean {
    const domainObject = this._domainObject;
    point = this.recalculatePoint(point, ray, domainObject.primitiveType);
    if (point === undefined) {
      return false;
    }
    this.addRawPoint(point, isPending);

    this.rebuild();
    domainObject.notify(Changes.geometry);
    if (this.isFinished) {
      domainObject.setFocusInteractive(FocusType.Focus);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private recalculatePoint(
    point: Vector3 | undefined,
    ray: Ray,
    _primitiveType: PrimitiveType
  ): Vector3 | undefined {
    // Recalculate the point anyway for >= 1 points
    // This makes it more natural and you can pick in empty space
    if (this.notPendingPointCount === 1) {
      if (this._isHorizontal) {
        if (point === undefined) {
          const plane = new Plane().setFromNormalAndCoplanarPoint(UP_VECTOR, this.firstPoint);
          const newPoint = ray.intersectPlane(plane, new Vector3());
          return newPoint ?? undefined;
        } else {
          point.x = this.firstPoint.x;
          point.y = this.firstPoint.y;
          return point;
        }
      } else {
        if (point === undefined) {
          const lineLength = ray.origin.distanceTo(this.firstPoint) * 100;
          const v0 = this.firstPoint.clone().addScaledVector(UP_VECTOR, -lineLength);
          const v1 = this.firstPoint.clone().addScaledVector(UP_VECTOR, +lineLength);

          const point = new Vector3();
          ray.distanceSqToSegment(v0, v1, undefined, point);
          return point;
        } else {
          point.z = this.firstPoint.z;
          return point;
        }
      }
    } else if (this.notPendingPointCount === 2) {
      const { center, axis } = this._domainObject;

      const lineLength = ray.origin.distanceTo(center) * 100;
      const v0 = center.clone().addScaledVector(axis, -lineLength);
      const v1 = center.clone().addScaledVector(axis, +lineLength);

      const pointOnRay = new Vector3();
      this._radius = Math.sqrt(ray.distanceSqToSegment(v0, v1, pointOnRay, undefined));
      this._radius = Math.max(this._radius, MIN_SIZE);
      return pointOnRay;
    }
    return point;
  }

  /**
   * Create the cylinder by adding points. The first point will make a centerA.
   * The second point will give the centerB.
   * The third will give radius. The radius is already calculated in the recalculatePoint
   */

  private rebuild(): void {
    if (this.pointCount === 0) {
      throw new Error('Cannot create a cylinder without points');
    }
    const domainObject = this._domainObject;
    if (this.pointCount === 1) {
      const { centerA, centerB } = this._domainObject;
      centerA.copy(this.firstPoint);
      centerB.copy(this.firstPoint);
      const smallVector = new Vector3(MIN_SIZE, 0, 0);
      centerA.sub(smallVector);
      centerB.add(smallVector);
      domainObject.forceMinSize();
    }
    if (this.pointCount === 2) {
      const { centerA, centerB } = this._domainObject;
      centerA.copy(this.firstPoint);
      centerB.copy(this.lastPoint);
      domainObject.forceMinSize();
    } else {
      domainObject.radius = this._radius;
    }
  }
}
