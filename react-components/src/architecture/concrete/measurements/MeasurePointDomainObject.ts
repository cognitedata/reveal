import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { Color } from 'three';
import { PointDomainObject } from '../primitives/point/PointDomainObject';

export class MeasurePointDomainObject extends PointDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.color = new Color(Color.NAMES.magenta);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override clone(what?: symbol): DomainObject {
    const clone = new MeasurePointDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }
}
