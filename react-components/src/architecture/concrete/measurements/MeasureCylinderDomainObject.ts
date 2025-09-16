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
    if (primitiveType === PrimitiveType.Diameter) {
      this.color = new Color(Color.NAMES.yellow);
      this.renderStyle.depthTest = false; // Should be visible through other geometry
      this.renderStyle.showLabel = true;
      this.renderStyle.relativeTextSize = 0.5; // Should use large labels
    } else {
      this.color = new Color(Color.NAMES.magenta);
    }
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

/**
 * Searches the descendants of the given root domain object for a `MeasureCylinderDomainObject`
 * whose `primitiveType` is `PrimitiveType.Diameter`. The reason for making this function is that we only have one
 * MeasureCylinderDomainObject with PrimitiveType.Diameter in the model at any time.
 *
 * @param root - The root `DomainObject` to search from.
 * @returns The first matching `MeasureCylinderDomainObject` with a diameter primitive type, or `undefined` if none is found.
 */
export function getMeasureDiameter(root: DomainObject): MeasureCylinderDomainObject | undefined {
  for (const descendant of root.getDescendantsByType(MeasureCylinderDomainObject)) {
    if (descendant.primitiveType === PrimitiveType.Diameter) {
      return descendant;
    }
  }
  return undefined;
}
