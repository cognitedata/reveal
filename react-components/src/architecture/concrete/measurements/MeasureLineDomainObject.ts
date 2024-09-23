/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { LineDomainObject } from '../primitives/line/LineDomainObject';
import { Color } from 'three';

export class MeasureLineDomainObject extends LineDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super(primitiveType);
    this.color = new Color(Color.NAMES.red);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override clone(what?: symbol): DomainObject {
    const clone = new MeasureLineDomainObject(this.primitiveType);
    clone.copyFrom(this, what);
    return clone;
  }
}
