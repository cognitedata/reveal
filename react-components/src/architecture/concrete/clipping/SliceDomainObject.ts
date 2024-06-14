/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { PlaneDomainObject } from '../primitives/plane/PlaneDomainObject';
import { type PrimitiveType } from '../primitives/PrimitiveType';

export class SliceDomainObject extends PlaneDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super(primitiveType);
    this.color = new Color(Color.NAMES.greenyellow);
    this.backSideColor = new Color(Color.NAMES.red);
  }
}
