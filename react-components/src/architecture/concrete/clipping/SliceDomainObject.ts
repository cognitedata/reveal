/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { PlaneDomainObject } from '../primitives/plane/PlaneDomainObject';
import { PrimitiveType } from '../primitives/PrimitiveType';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { FlipSliceCommand } from './commands/FlipSliceCommand';

export class SliceDomainObject extends PlaneDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super(primitiveType);
    this.color = new Color(Color.NAMES.greenyellow);
    this.backSideColor = new Color(Color.NAMES.red);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get typeName(): TranslateKey {
    switch (this.primitiveType) {
      case PrimitiveType.PlaneX:
        return { key: 'SLICE_X', fallback: 'X slice' };
      case PrimitiveType.PlaneY:
        return { key: 'SLICE_Y', fallback: 'Y slice' };
      case PrimitiveType.PlaneZ:
        return { key: 'SLICE_Z', fallback: 'Z slice' };
      case PrimitiveType.PlaneXY:
        return { key: 'SLICE_XY', fallback: 'XY slice' };
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public override getPanelToolbar(): BaseCommand[] {
    const commands = super.getPanelToolbar();
    commands.push(new FlipSliceCommand(this));
    return commands;
  }
}
