/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type PrimitiveType } from '../primitives/common/PrimitiveType';
import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color } from 'three';

export class MeasureBoxDomainObject extends BoxDomainObject {
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
    const clone = new MeasureBoxDomainObject(this.primitiveType);
    clone.copyFrom(this, what);
    return clone;
  }
}
