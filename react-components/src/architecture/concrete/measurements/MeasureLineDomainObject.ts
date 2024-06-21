/*!
 * Copyright 2024 Cognite AS
 */

import { type PrimitiveType } from '../primitives/PrimitiveType';
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
}
