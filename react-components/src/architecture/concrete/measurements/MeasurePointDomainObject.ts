import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { Color } from 'three';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { BoxDomainObject } from '../primitives/box/BoxDomainObject';

export class MeasurePointDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(PrimitiveType.Point);
    this.color = new Color(Color.NAMES.deepskyblue);
    this.box.size.setScalar(1);
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
