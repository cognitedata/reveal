import { Plane, type Ray, Vector3 } from 'three';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayUtils';
import { rotatePiHalf } from '../../../base/utilities/extensions/vectorUtils';

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

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(domainObject: CylinderDomainObject, primitiveType?: PrimitiveType) {
    super();
    this._primitiveType = primitiveType ?? domainObject.primitiveType;
    this._domainObject = domainObject;
    this._domainObject.focusType = FocusType.Pending;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get preferIntersection(): boolean {
    if (this._domainObject.primitiveType === PrimitiveType.HorizontalCylinder) {
      return this.pointCount <= 2;
    }
    return this.pointCount <= 1;
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
    if (this.notPendingPointCount === 1) {
      // This point will give the diameter, and the center will be the average of this point and the first
      if (point !== undefined) {
        if (this._primitiveType !== PrimitiveType.HorizontalCylinder) {
          point.z = this.firstPoint.z; // The z level should be set by the first point
        }
        return point;
      }
      // If the done when pointing in the "air". Try to calculate a reasonable good value, based on the ray.
      if (this._primitiveType === PrimitiveType.HorizontalCylinder) {
        const { center } = this._domainObject.cylinder;
        const plane = new Plane().setFromNormalAndCoplanarPoint(ray.direction, center);
        const pointOnRay = ray.intersectPlane(plane, new Vector3());
        if (pointOnRay !== null) {
          return pointOnRay;
        }
      } else {
        const plane = new Plane().setFromNormalAndCoplanarPoint(UP_VECTOR, this.firstPoint);
        const pointOnRay = ray.intersectPlane(plane, new Vector3());
        if (pointOnRay !== null) {
          pointOnRay.z = this.firstPoint.z; // The z level should be set by the first point
          return pointOnRay;
        }
      }
      return undefined;
    } else if (this.notPendingPointCount === 2) {
      // Calculate the other center point regardless of the input point
      const { center, axis } = this._domainObject.cylinder;
      return getClosestPointOnLine(ray, axis, center);
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
      // Add point 1
      this.setCenter(this.firstPoint, ray.direction.clone());
    } else if (this.pointCount === 2) {
      // Add point 2: This will recalculate the center, the diameter ans the axis (for horizontal cylinder)
      const center = this.firstPoint.clone().add(this.lastPoint).multiplyScalar(0.5);
      if (this._domainObject.primitiveType === PrimitiveType.HorizontalCylinder) {
        // Calculate the center and axis for the first two points
        const axis = this.firstPoint.clone().sub(this.lastPoint);
        rotatePiHalf(axis);
        this.setCenter(center, axis);

        const plane = new Plane().setFromNormalAndCoplanarPoint(axis, center);
        const firstPoint = plane.projectPoint(this.firstPoint, new Vector3());
        const lastPoint = plane.projectPoint(this.lastPoint, new Vector3());
        cylinder.radius = firstPoint.distanceTo(lastPoint) / 2;
      } else {
        this.setCenter(center, UP_VECTOR);
        cylinder.radius = this.firstPoint.distanceTo(this.lastPoint) / 2;
      }
    } else if (this.pointCount === 3) {
      // Add point 3 and define the length
      const center = this.firstPoint.clone().add(this.points[1]).multiplyScalar(0.5);
      cylinder.centerA.copy(center);
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
