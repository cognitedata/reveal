/*!
 * Copyright 2024 Cognite AS
 */

import { Matrix4, Plane, type Ray, Vector3 } from 'three';
import {
  horizontalAngle,
  verticalDistanceTo
} from '../../../base/utilities/extensions/vectorExtensions';
import { Range3 } from '../../../base/utilities/geometry/Range3';
import { forceBetween0AndPi } from '../../../base/utilities/extensions/mathExtensions';
import { PrimitiveType } from '../PrimitiveType';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayExtensions';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type BoxDomainObject } from './BoxDomainObject';
import { type BaseTool } from '../../../base/commands/BaseTool';

const UP_VECTOR = new Vector3(0, 0, 1);
/**
 * Helper class for generate a BoxDomainObject by clicking around
 */
export class BoxCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: BoxDomainObject;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(tool: BaseTool, domainObject: BoxDomainObject) {
    super(tool);
    this._domainObject = domainObject;
    this._domainObject.focusType = FocusType.Pending;
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
    switch (this._domainObject.primitiveType) {
      case PrimitiveType.VerticalArea:
        return 2;
      case PrimitiveType.HorizontalArea:
        return 3;
      case PrimitiveType.Box:
        return 4;
      default:
        throw new Error('Unknown primitiveType');
    }
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
    primitiveType: PrimitiveType
  ): Vector3 | undefined {
    if (primitiveType === PrimitiveType.VerticalArea) {
      return point;
    }
    // Recalculate the point anyway for >= 1 points
    // This makes it more natural and you can pick in empty space
    if (this.notPendingPointCount === 1 || this.notPendingPointCount === 2) {
      const plane = new Plane().setFromNormalAndCoplanarPoint(UP_VECTOR, this.firstPoint);
      const newPoint = ray.intersectPlane(plane, new Vector3());
      return newPoint ?? undefined;
    } else if (this.notPendingPointCount === 3 && primitiveType === PrimitiveType.Box) {
      return getClosestPointOnLine(ray, UP_VECTOR, this.points[2], point);
    }
    return point;
  }

  /**
   * Create the box by adding points. The first point will make a box with a center and a tiny size.
   * The second point will give the zRotation and the size.x and center.x
   * The third will give the size.y and center.y
   * The third will give the size.z and center.z
   */

  private rebuild(): void {
    if (this.pointCount === 0) {
      throw new Error('Cannot create a box without points');
    }
    const domainObject = this._domainObject;
    if (this.pointCount === 1) {
      domainObject.forceMinSize();
      domainObject.center.copy(this.firstPoint);
      if (domainObject.primitiveType !== PrimitiveType.VerticalArea) {
        domainObject.center.z += domainObject.size.z / 2;
      }
      return;
    }
    if (this.pointCount === 2) {
      // Set the zRotation
      const vector = new Vector3().subVectors(this.firstPoint, this.lastPoint);
      domainObject.zRotation = forceBetween0AndPi(horizontalAngle(vector));
    }
    const primitiveType = domainObject.primitiveType;
    if (this.pointCount <= 3) {
      // Set the center and the size only in 2D space
      const newCenter = new Vector3();
      const newSize = new Vector3();
      this.getCenterAndSizeFromBoundingBox(domainObject.zRotation, newCenter, newSize);

      domainObject.center.x = newCenter.x;
      domainObject.size.x = newSize.x;

      if (primitiveType === PrimitiveType.VerticalArea) {
        domainObject.center.z = newCenter.z;
        domainObject.center.y = newCenter.y;
        domainObject.size.z = newSize.z;
      } else {
        domainObject.center.y = newCenter.y;
        domainObject.size.y = newSize.y;
      }
      domainObject.forceMinSize();
    } else {
      // Now set the 3D center and size
      const p2 = this.points[2];
      const p3 = this.points[3];
      const sizeZ = verticalDistanceTo(p2, p3);
      const centerZ = (p2.z + p3.z) / 2;
      domainObject.size.z = sizeZ;
      domainObject.center.z = centerZ;
    }
  }

  private getCenterAndSizeFromBoundingBox(zRotation: number, center: Vector3, size: Vector3): void {
    const matrix = new Matrix4().makeRotationZ(zRotation);
    const inverseMatrix = matrix.clone().invert();
    const range = new Range3();
    for (const point of this.points) {
      const copy = point.clone();
      copy.applyMatrix4(inverseMatrix);
      range.add(copy);
    }
    range.getCenter(center);
    range.getDelta(size);
    center.applyMatrix4(matrix);
  }
}
