import { Plane, type Ray, Vector3 } from 'three';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';

const UP_VECTOR = new Vector3(0, 0, 1);
/**
 * Helper class for generate a CylinderDomainObject by clicking around
 */
export class CylinderCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: CylinderDomainObject;
  private _radius = Cylinder.MinSize;
  private readonly _primitiveType: PrimitiveType;
  private readonly _isReversedClickOrder;

  // Click order for the points (point 0 is always center)
  private get radiusOrder(): number {
    return this._isReversedClickOrder ? 2 : 1;
  }

  private get otherCenterOrder(): number {
    return this._isReversedClickOrder ? 1 : 2;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(
    domainObject: CylinderDomainObject,
    primitiveType?: PrimitiveType,
    isReversedClickOrder = false
  ) {
    super();
    this._primitiveType = primitiveType ?? domainObject.primitiveType;
    this._domainObject = domainObject;
    this._domainObject.focusType = FocusType.Pending;

    // Click order for the points (Used for 3D annotations)
    this._isReversedClickOrder = isReversedClickOrder;
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
    if (this._domainObject.primitiveType === PrimitiveType.HorizontalCircle) {
      return 2;
    }
    return 3;
  }

  protected override addPointCore(
    ray: Ray,
    point: Vector3 | undefined,
    isPending: boolean
  ): boolean {
    const domainObject = this._domainObject;
    point = this.recalculatePoint(point, ray);
    if (point === undefined) {
      return false;
    }
    this.addRawPoint(point, isPending);
    this.rebuild(ray);

    domainObject.notify(Changes.geometry);
    if (this.isFinished) {
      domainObject.setFocusInteractive(FocusType.Focus);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private recalculatePoint(point: Vector3 | undefined, ray: Ray): Vector3 | undefined {
    // Recalculate the point anyway for >= 1 points
    // This makes it more natural and you can pick in empty space
    if (this.notPendingPointCount === this.otherCenterOrder) {
      // Calculate the other center point
      if (this._primitiveType === PrimitiveType.HorizontalCylinder) {
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
    } else if (this.notPendingPointCount === this.radiusOrder) {
      // Calculate the radius
      const { center, axis } = this._domainObject.cylinder;

      if (this.radiusOrder === 1) {
        // When radius is the second point, we can calculate it from the intersection with the plane
        const plane = new Plane().setFromNormalAndCoplanarPoint(axis, center);
        const pointOnRay = ray.intersectPlane(plane, new Vector3());
        if (pointOnRay !== null) {
          this._radius = pointOnRay?.distanceTo(center);
          this._radius = Math.max(this._radius, Cylinder.MinSize);
          return pointOnRay;
        }
      }
      const lineLength = ray.origin.distanceTo(center) * 100;
      const v0 = center.clone().addScaledVector(axis, -lineLength);
      const v1 = center.clone().addScaledVector(axis, +lineLength);

      const pointOnRay = new Vector3();
      this._radius = Math.sqrt(ray.distanceSqToSegment(v0, v1, pointOnRay, undefined));
      this._radius = Math.max(this._radius, Cylinder.MinSize);
      return pointOnRay;
    }
    return point;
  }

  /**
   * Create the cylinder by adding points. The first point will make a centerA.
   * The second/third point will give the centerB.
   * The third/second will give radius. The radius is already calculated in the recalculatePoint
   */

  private rebuild(ray: Ray): void {
    if (this.pointCount === 0) {
      throw new Error('Cannot create a cylinder without points');
    }
    const { cylinder } = this._domainObject;
    if (this.pointCount === 1) {
      const { centerA, centerB } = cylinder;
      centerA.copy(this.firstPoint);
      centerB.copy(this.firstPoint);
      if (this._primitiveType === PrimitiveType.HorizontalCylinder) {
        const axis = ray.direction.clone();
        axis.z = 0;
        axis.normalize();
        centerA.addScaledVector(axis, -Cylinder.HalfMinSize);
        centerB.addScaledVector(axis, +Cylinder.HalfMinSize);
      } else {
        centerA.z -= Cylinder.HalfMinSize;
        centerB.z += Cylinder.HalfMinSize;
      }
    } else if (this.pointCount - 1 === this.otherCenterOrder) {
      const { centerA, centerB } = cylinder;
      centerA.copy(this.firstPoint);
      centerB.copy(this.lastPoint);
    } else if (this.pointCount - 1 === this.radiusOrder) {
      cylinder.radius = this._radius;
    }
    cylinder.forceMinSize();
  }
}
