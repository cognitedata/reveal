/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../RenderTargetCommand';

export abstract class SliderCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS
  // =================================================

  readonly min: number;
  readonly max: number;
  readonly step: number;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(min: number, max: number, step: number) {
    super();
    this.min = min;
    this.max = max;
    this.step = step;
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // =================================================

  public abstract get value(): number;

  public abstract set value(value: number);
}
