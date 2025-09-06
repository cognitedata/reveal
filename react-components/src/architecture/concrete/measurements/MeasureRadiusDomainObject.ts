import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { CylinderDomainObject } from '../primitives/cylinder/CylinderDomainObject';
import { Color } from 'three';

export class MeasureRadiusDomainObject extends CylinderDomainObject {
  public constructor() {
    super(PrimitiveType.Radius);
    this.color = new Color(Color.NAMES.yellow);
    this.renderStyle.showLabel = true;
    this.renderStyle.depthTest = false;
    this.renderStyle.relativeTextSize = 0.5;
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new MeasureRadiusDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  public override get hasIndexOnLabel(): boolean {
    return false; // Because it's only one of this type
  }
}
