/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { type BaseCommand } from './BaseCommand';
import { RenderTargetCommand } from './RenderTargetCommand';

/**
 * Base class for all option like commands. Override createOptions to add options
 * or use add method to add them in.
 */

export abstract class BaseOptionCommand extends RenderTargetCommand {
  private _options: BaseCommand[] | undefined = undefined;

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override attach(renderTarget: RevealRenderTarget): void {
    this._renderTarget = renderTarget;
    for (const option of this.options) {
      if (option instanceof RenderTargetCommand) {
        option.attach(renderTarget);
      }
    }
  }
  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  protected createOptions(): BaseCommand[] {
    return []; // Override this to add options or use the add method
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get options(): BaseCommand[] {
    if (this._options === undefined) {
      this._options = this.createOptions();
    }
    return this._options;
  }

  public get selectedOption(): BaseCommand | undefined {
    return this.options.find((option) => option.isChecked);
  }

  protected add(command: BaseCommand): void {
    this.options.push(command);
  }
}
