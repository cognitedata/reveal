/*!
 * Copyright 2024 Cognite AS
 */

import { PrimitiveType } from '../boxAndLines/PrimitiveType';
import { LineDomainObject } from '../boxAndLines/LineDomainObject';
import { getIconByPrimitiveType } from './getIconByPrimitiveType';
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
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): string {
    switch (this.primitiveType) {
      case PrimitiveType.Line:
        return 'Line';
      case PrimitiveType.Polyline:
        return 'Polyline';
      case PrimitiveType.Polygon:
        return 'Polygon';
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }
}
