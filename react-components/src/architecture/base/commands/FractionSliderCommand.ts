/*!
 * Copyright 2024 Cognite AS
 */

import { BaseSliderCommand } from './BaseSliderCommand';

export abstract class FractionSliderCommand extends BaseSliderCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(0, 1, 0.01);
  }

  // ==================================================
  // OVERRIDES
  // =================================================

  public override getValueLabel(): string {
    return Math.round(100 * this.value) + '%';
  }
}
