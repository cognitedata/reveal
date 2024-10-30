/*!
 * Copyright 2024 Cognite AS
 */

import { BaseSliderCommand } from './BaseSliderCommand';

const MIN_VALUE = 0;
const MAX_VALUE = 1;
const STEP_VALUE = 0.02;
export abstract class FractionSliderCommand extends BaseSliderCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(MIN_VALUE, MAX_VALUE, STEP_VALUE);
  }

  // ==================================================
  // OVERRIDES
  // =================================================

  public override getValueLabel(): string {
    return Math.round(100 * this.value) + '%';
  }
}
