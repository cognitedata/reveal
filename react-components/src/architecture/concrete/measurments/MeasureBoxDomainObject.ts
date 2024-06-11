/*!
 * Copyright 2024 Cognite AS
 */

import { PrimitiveType } from '../box/PrimitiveType';
import { BoxDomainObject } from '../box/BoxDomainObject';
import { Color } from 'three';
import { getIconByPrimitiveType } from './getIconByPrimitiveType';

export const MIN_BOX_SIZE = 0.01;

export class MeasureBoxDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super(primitiveType);
    this.color = new Color(Color.NAMES.magenta);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): string {
    switch (this.primitiveType) {
      case PrimitiveType.HorizontalArea:
        return 'Horizontal area';
      case PrimitiveType.VerticalArea:
        return 'Vertical area';
      case PrimitiveType.Box:
        return 'Volume';
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }
}
