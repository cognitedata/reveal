/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../RenderTargetCommand';

export abstract class ToggleCommand extends RenderTargetCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor() {
    super();
  }

  protected override invokeCore(): boolean {
    this.setChecked(!this.isChecked);
    return true;
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // =================================================

  public abstract setChecked(value: boolean): void;
}
