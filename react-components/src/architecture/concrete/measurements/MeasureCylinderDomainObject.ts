import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { CylinderDomainObject } from '../primitives/cylinder/CylinderDomainObject';
import { Color } from 'three';

export class MeasureCylinderDomainObject extends CylinderDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super(primitiveType);
    this.color = new Color(Color.NAMES.magenta);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override clone(what?: symbol): DomainObject {
    const clone = new MeasureCylinderDomainObject(this.primitiveType);
    clone.copyFrom(this, what);
    return clone;
  }

  public override get hasIndexOnLabel(): boolean {
    return this.primitiveType !== PrimitiveType.Diameter; // Because it's only one of this type
  }
}

export function getMeasureDiameter(root: DomainObject): MeasureCylinderDomainObject | undefined {
  for (const descendant of root.getDescendantsByType(MeasureCylinderDomainObject)) {
    if (descendant.primitiveType === PrimitiveType.Diameter) {
      return descendant;
    }
  }
  return undefined;
}
