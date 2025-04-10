/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from './RenderTargetCommand';

export abstract class BaseSliderCommand extends RenderTargetCommand {
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

  public get marks(): Record<number, { label: string }> | undefined {
    return undefined;
  }

  public abstract get value(): number;

  public abstract set value(value: number);

  public getValueLabel(): string {
    return this.value.toString();
  }
}
