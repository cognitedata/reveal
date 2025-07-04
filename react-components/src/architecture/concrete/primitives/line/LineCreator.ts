import { Plane, type Ray, Vector3 } from 'three';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { copy } from '../../../base/utilities/extensions/arrayUtils';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type LineDomainObject } from './LineDomainObject';
import { type UndoManager } from '../../../base/undo/UndoManager';
import { getRenderTarget } from '../../../base/domainObjects/getRoot';
import { CommandsUpdater } from '../../../base/reactUpdaters/CommandsUpdater';

/**
 * Helper class for generate a LineDomainObject by clicking around
 */
export class LineCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: LineDomainObject;
  private readonly _undoManager?: UndoManager;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(domainObject: LineDomainObject, undoManager?: UndoManager) {
    super();
    this._domainObject = domainObject;
    this._domainObject.focusType = FocusType.Pending;
    this._undoManager = undoManager;
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
    switch (this._domainObject.primitiveType) {
      case PrimitiveType.Polygon:
        return 3;
      default:
        return 2;
    }
  }

  public override get maximumPointCount(): number {
    switch (this._domainObject.primitiveType) {
      case PrimitiveType.Line:
        return 2;
      default:
        return Number.MAX_SAFE_INTEGER;
    }
  }

  protected override addPointCore(
    ray: Ray,
    point: Vector3 | undefined,
    isPending: boolean
  ): boolean {
    point = this.transformInputPoint(ray, point, isPending);
    if (point === undefined) {
      return false;
    }
    const domainObject = this._domainObject;
    if (this.lastIsPending) {
      domainObject.points.pop();
    }

    if (this.pointCount !== domainObject.pointCount) {
      // In case of undo is done
      copy(this.points, domainObject.points);
      this.lastIsPending = false;
    }
    this.addRawPoint(point, isPending);

    if (!isPending && domainObject.hasParent && this._undoManager !== undefined) {
      const exists = this._undoManager.hasUniqueId(domainObject.uniqueId);
      const needsUpdate = this._undoManager.addTransaction(
        domainObject.createTransaction(exists ? Changes.geometry : Changes.added)
      );
      if (needsUpdate) {
        CommandsUpdater.update(getRenderTarget(domainObject));
      }
    }
    copy(domainObject.points, this.points);

    domainObject.notify(Changes.geometry);
    if (this.isFinished) {
      domainObject.setFocusInteractive(FocusType.Focus);
    }
    return true;
  }

  public override escape(): boolean {
    const domainObject = this._domainObject;
    if (this.notPendingPointCount < this.minimumPointCount) {
      domainObject.removeInteractive();
      return false; // Removed
    } else if (this.lastIsPending) {
      domainObject.points.pop();
      this.removePendingPoint();
      domainObject.notify(Changes.geometry);
    }
    domainObject.setFocusInteractive(FocusType.Focus);
    return true; // Successfully
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  protected transformInputPoint(
    ray: Ray,
    point: Vector3 | undefined,
    isPending: boolean
  ): Vector3 | undefined {
    if (!isPending || this.notPendingPointCount === 1 || point !== undefined) {
      return point;
    }
    // Figure out where the point should be if no intersection
    const lastPoint = this.lastNotPendingPoint;
    const plane = new Plane().setFromNormalAndCoplanarPoint(ray.direction, lastPoint);
    const newPoint = ray.intersectPlane(plane, new Vector3());
    if (newPoint === null) {
      return undefined;
    }
    return newPoint;
  }
}
