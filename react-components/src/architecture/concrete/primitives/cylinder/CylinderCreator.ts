import { Plane, type Ray, Vector3 } from 'three';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayExtensions';
import { rotatePiHalf } from '../../../base/utilities/extensions/vectorExtensions';

const UP_VECTOR = new Vector3(0, 0, 1);
/**
 * Helper class for generate a CylinderDomainObject by clicking around
 */
export class CylinderCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: CylinderDomainObject;
  private readonly _primitiveType: PrimitiveType;
  private readonly _isReversedClickOrder;

  // Click order for the points (point 0 is always center)
  private get diameterOrder(): number {
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

  public override get preferIntersection(): boolean {
    return this.pointCount === 0;
  }

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
      console.log('point is undefined');
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
      // Calculate the other center point regardless of the input point
      const { center, axis } = this._domainObject.cylinder;
      console.log('recalculatePoint A');
      return getClosestPointOnLine(ray, axis, center);
    } else if (this.notPendingPointCount === this.diameterOrder) {
      const { center, axis } = this._domainObject.cylinder;

      if (this.diameterOrder === 1) {
        if (point !== undefined) {
          console.log('recalculatePoint Ea ss');
          return point;
        }

        // When diameter is the second point, we can calculate it from the intersection with the plane
        if (this._primitiveType === PrimitiveType.HorizontalCylinder) {
          const plane = new Plane().setFromNormalAndCoplanarPoint(ray.direction, center);
          const pointOnRay = ray.intersectPlane(plane, new Vector3());
          if (pointOnRay !== null) {
            console.log('recalculatePoint Ea');
            return pointOnRay;
          }
        } else {
          const plane = new Plane().setFromNormalAndCoplanarPoint(UP_VECTOR, center);
          const pointOnRay = ray.intersectPlane(plane, new Vector3());
          if (pointOnRay !== null) {
            console.log('recalculatePoint Eb');
            return pointOnRay;
          }
        }
      }
      console.log('recalculatePoint F');
      return getClosestPointOnLine(ray, axis, center);
    }
    console.log('recalculatePoint G');
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
      console.log('rebuild 1 a');
      // Add point 1
      this.setCenter(this.firstPoint, ray.direction.clone());
    } else if (this.pointCount - 1 === this.diameterOrder) {
      // Add point 2: the diameter the second point so it defined the center, axis and the diameter
      console.log('rebuild 2 b');
      const center = this.firstPoint.clone().add(this.lastPoint).multiplyScalar(0.5);
      const axis = this.firstPoint.clone().sub(this.lastPoint);
      rotatePiHalf(axis);
      this.setCenter(center, axis);

      const plane = new Plane().setFromNormalAndCoplanarPoint(axis, center);
      const firstPoint = plane.projectPoint(this.firstPoint, new Vector3());
      const lastPoint = plane.projectPoint(this.lastPoint, new Vector3());
      cylinder.radius = firstPoint.distanceTo(lastPoint) / 2;
    } else if (this.pointCount - 1 === this.otherCenterOrder) {
      // Add point 3 and define the length
      console.log('rebuild 3 c');
      cylinder.centerB.copy(this.lastPoint);
    }
    cylinder.forceMinSize();
  }

  private setCenter(center: Vector3, axis: Vector3): void {
    if (this._primitiveType === PrimitiveType.HorizontalCylinder) {
      axis.z = 0;
      axis.normalize();
    } else {
      axis.set(0, 0, 1);
    }
    const { cylinder } = this._domainObject;
    const { centerA, centerB } = cylinder;
    centerA.copy(center);
    centerB.copy(center);
    centerA.addScaledVector(axis, -Cylinder.HalfMinSize);
    centerB.addScaledVector(axis, +Cylinder.HalfMinSize);
    cylinder.forceMinSize();
  }
}
