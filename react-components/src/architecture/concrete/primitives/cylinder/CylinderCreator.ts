import { Plane, type Ray, Vector3 } from 'three';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayUtils';
import { horizontalDistanceTo, rotatePiHalf } from '../../../base/utilities/extensions/vectorUtils';

const UP_VECTOR = new Vector3(0, 0, 1);
/**
 * Helper class for generate a CylinderDomainObject by clicking around
 * Here is the way it works:
 * * - The first point will be one side of the cylinder
 * * - The second point will be the other side of the cylinder, so the diameter will be the distance between the first 2 point
 *     and the one of the end center points will be the average of the first 2 points.
 *     Here we also calculate the axis of to horizontal cylinder. The vertical cylinder will always have the axis as UP_VECTOR.
 * * - The third point will be the height of the cylinder.
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
      // If pointing in the "air", try to calculate a reasonable good value, based on the ray.
      if (this._primitiveType === PrimitiveType.HorizontalCylinder) {
        const { center } = this._domainObject.cylinder;

        // Create an intersection between a plane towards the ray and ray itself
        // This will give the second point
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
      // Calculate the other center point regardless of the input point, just using the ray
      const { center, axis } = this._domainObject.cylinder;
      return getClosestPointOnLine(ray, axis, center);
    }
    return point;
  }

  private rebuild(ray: Ray): void {
    if (this.pointCount === 0) {
      throw new Error('Cannot create a cylinder without points');
    }
    const { cylinder } = this._domainObject;
    if (this.pointCount === 1) {
      // Point 1: Defined the center and the axis. This is later moved by the second point
      if (this._primitiveType === PrimitiveType.HorizontalCylinder) {
        const axis = new Vector3();
        forceHorizontalDirection(axis, ray);
        this.setCenter(this.firstPoint, axis);
      } else {
        this.setCenter(this.firstPoint, UP_VECTOR);
      }
    } else if (this.pointCount === 2) {
      // Point 2: This will recalculate the center, the diameter and the axis (for horizontal cylinder)
      const center = this.firstPoint.clone().add(this.lastPoint).multiplyScalar(0.5);
      if (this._domainObject.primitiveType === PrimitiveType.HorizontalCylinder) {
        // Calculate the axis:
        const axis = this.firstPoint.clone().sub(this.lastPoint);
        rotatePiHalf(axis);
        forceHorizontalDirection(axis, ray);
        this.setCenter(center, axis);

        // Calculate the radius by projecting the first and last point onto the plane defined by the axis and center
        const plane = new Plane().setFromNormalAndCoplanarPoint(axis, center);
        const firstPoint = plane.projectPoint(this.firstPoint, new Vector3());
        const lastPoint = plane.projectPoint(this.lastPoint, new Vector3());
        cylinder.radius = firstPoint.distanceTo(lastPoint) / 2;
      } else {
        this.setCenter(center, UP_VECTOR);
        cylinder.radius = horizontalDistanceTo(this.firstPoint, this.lastPoint) / 2;
      }
    } else if (this.pointCount === 3) {
      // Point 3: Define the height of the cylinder, by setting both centers
      const center = this.firstPoint.clone().add(this.points[1]).multiplyScalar(0.5);
      cylinder.centerA.copy(center);
      cylinder.centerB.copy(this.lastPoint);
    }
    cylinder.forceMinSize();
  }

  private setCenter(center: Vector3, axis: Vector3): void {
    const { cylinder } = this._domainObject;
    const { centerA, centerB } = cylinder;
    centerA.copy(center);
    centerB.copy(center);

    // Set the height and radius of the cylinder to be MinSize
    centerA.addScaledVector(axis, -Cylinder.HalfMinSize);
    centerB.addScaledVector(axis, +Cylinder.HalfMinSize);
    cylinder.forceMinSize();
  }
}

function forceHorizontalDirection(vector: Vector3, ray: Ray): void {
  vector.z = 0;
  if (vector.length() === 0) {
    // If the x and y component is not set, we take it from the ray direction
    // This is to ensure that the axis is meaningful
    vector.copy(ray.direction);
    vector.z = 0;
    if (vector.length() === 0) {
      // If the x and y component is still not set, we just select an arbitrary horizontal direction
      vector.set(1, 0, 0);
    }
  }
  // Now we have a horizontal vector with some length, this need to be normalized.
  vector.normalize();
}
