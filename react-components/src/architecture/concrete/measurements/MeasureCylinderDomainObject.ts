/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
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

  public override get canRotate(): boolean {
    return false;
  }
}
