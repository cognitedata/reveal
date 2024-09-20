/*!
 * Copyright 2024 Cognite AS
 */

import { Plane, type Ray, Vector3 } from 'three';
import { PrimitiveType } from '../common/PrimitiveType';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { copy } from '../../../base/utilities/extensions/arrayExtensions';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type LineDomainObject } from './LineDomainObject';
import { type BaseTool } from '../../../base/commands/BaseTool';

/**
 * Helper class for generate a LineDomainObject by clicking around
 */
export class LineCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: LineDomainObject;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(tool: BaseTool, domainObject: LineDomainObject) {
    super(tool);
    this._domainObject = domainObject;
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
    switch (this._domainObject.primitiveType) {
      case PrimitiveType.Line:
        return 2;
      case PrimitiveType.Polyline:
      case PrimitiveType.Polygon:
        return Number.MAX_SAFE_INTEGER;
      default:
        throw new Error('Unknown primitiveType');
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
    const domainObject = this._domainObject;
    if (this.lastIsPending) {
      domainObject.points.pop();
    }

    if (this.pointCount !== domainObject.points.length) {
      // In case of undo is done
      copy(this.points, domainObject.points);
      this.lastIsPending = false;
    }
    this.addRawPoint(point, isPending);

    if (!isPending && domainObject.hasParent && this._tool.undoManager !== undefined) {
      const exists = this._tool.undoManager.hasUniqueId(domainObject.uniqueId);
      this._tool.addTransaction(
        domainObject.createTransaction(exists ? Changes.geometry : Changes.added)
      );
    }
    copy(domainObject.points, this.points);

    domainObject.notify(Changes.geometry);
    if (this.isFinished) {
      domainObject.setFocusInteractive(FocusType.Focus);
    }
    return true;
  }

  public override onEscapeKey(): boolean {
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
