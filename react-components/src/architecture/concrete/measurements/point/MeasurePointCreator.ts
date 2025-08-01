import { type Ray, type Vector3 } from 'three';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type MeasurePointDomainObject } from './MeasurePointDomainObject';

/**
 * The `PointCreator` is responsible for handling the creation of a single point,
 * updating its initial positionIt extends the `BaseCreator` class and
 * operates on a `BoxDomainObject`, and setting the center of this.
 */
export class MeasurePointCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: MeasurePointDomainObject;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(domainObject: MeasurePointDomainObject) {
    super();
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
    return 1;
  }

  public override get maximumPointCount(): number {
    return 1;
  }

  protected override addPointCore(
    ray: Ray,
    point: Vector3 | undefined,
    isPending: boolean
  ): boolean {
    const domainObject = this._domainObject;
    if (point === undefined) {
      return false;
    }
    domainObject.point = point;
    domainObject.size = ray.origin.distanceTo(point) * 0.03; // Set size based on distance
    this.addRawPoint(point, isPending);
    domainObject.notify(Changes.geometry);
    domainObject.setFocusInteractive(FocusType.Focus);
    return true;
  }
}
