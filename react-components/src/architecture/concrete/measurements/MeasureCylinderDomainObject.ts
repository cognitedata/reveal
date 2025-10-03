import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { CylinderDomainObject } from '../primitives/cylinder/CylinderDomainObject';
import { Color } from 'three';

export class MeasureCylinderDomainObject extends CylinderDomainObject {
  public constructor(primitiveType: PrimitiveType) {
    super(primitiveType);
    if (primitiveType === PrimitiveType.Diameter) {
      this.color = new Color(Color.NAMES.yellow);
      this.renderStyle.depthTest = false; // Should be visible through other geometry
      this.renderStyle.relativeTextSize *= 2; // Should use larger labels
    } else {
      this.color = new Color(Color.NAMES.magenta);
    }
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new MeasureCylinderDomainObject(this.primitiveType);
    clone.copyFrom(this, what);
    return clone;
  }
}
