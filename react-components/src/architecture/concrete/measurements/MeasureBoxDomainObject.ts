/*!
 * Copyright 2024 Cognite AS
 */

import { type PrimitiveType } from '../primitives/PrimitiveType';
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
}
