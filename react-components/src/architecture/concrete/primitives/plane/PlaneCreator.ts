/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, Vector3 } from 'three';
import { PrimitiveType } from '../common/PrimitiveType';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type PlaneDomainObject } from './PlaneDomainObject';
import { rotatePiHalf } from '../../../base/utilities/extensions/vectorExtensions';
import { type BaseTool } from '../../../base/commands/BaseTool';

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

  public constructor(tool: BaseTool, domainObject: PlaneDomainObject) {
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

  public override get preferIntersection(): boolean {
    return true;
  }

  public override get minimumPointCount(): number {
    return this.maximumPointCount;
  }

  public override get maximumPointCount(): number {
    switch (this._domainObject.primitiveType) {
      case PrimitiveType.PlaneX:
      case PrimitiveType.PlaneY:
      case PrimitiveType.PlaneZ:
        return 1;
      case PrimitiveType.PlaneXY:
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

  private rebuild(ray: Ray): void {
    if (this.pointCount === 0) {
      throw new Error('Cannot create a plane without points');
    }
    const domainObject = this._domainObject;
    let normal: Vector3;
    switch (domainObject.primitiveType) {
      case PrimitiveType.PlaneX:
        normal = new Vector3(1, 0, 0);
        break;

      case PrimitiveType.PlaneY:
        normal = new Vector3(0, 1, 0);
        break;

      case PrimitiveType.PlaneZ:
        normal = new Vector3(0, 0, 1);
        break;

      case PrimitiveType.PlaneXY:
        if (this.pointCount === 1) {
          normal = ray.direction.clone().normalize();
        } else {
          normal = new Vector3().subVectors(this.lastPoint, this.firstPoint).normalize();
          rotatePiHalf(normal);
        }
        break;

      default:
        return;
    }
    // Make sure that the normal is pointing towards the camera
    if (ray.direction.dot(normal) < 0) {
      normal.negate();
    }
    domainObject.plane.setFromNormalAndCoplanarPoint(normal, this.firstPoint);
  }
}
