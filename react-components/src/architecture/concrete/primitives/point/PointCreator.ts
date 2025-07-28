import { type Ray, type Vector3 } from 'three';
import { BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type BoxDomainObject } from '../box/BoxDomainObject';

export class PointCreator extends BaseCreator {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: BoxDomainObject;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(domainObject: BoxDomainObject) {
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

  public override get preferIntersection(): boolean {
    return true;
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
    domainObject.box.center.copy(point);
    this.addRawPoint(point, isPending);
    domainObject.notify(Changes.geometry);
    domainObject.setFocusInteractive(FocusType.Focus);
    return true;
  }
}
