/*!
 * Copyright 2024 Cognite AS
 */

import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { BaseCommand } from './BaseCommand';
import { RenderTargetCommand } from './RenderTargetCommand';

/**
 * Base class for all command and tools. These are object that can do a
 * user interaction with the system. It also have enough information to
 * generate the UI for the command.
 */

export abstract class BaseOptionCommand extends BaseCommand {
  private _options: BaseCommand[] | undefined = undefined;

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public createOptions(): BaseCommand[] {
    return []; // Override this to add options
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getOrCreateOptions(renderTarget: RevealRenderTarget): BaseCommand[] {
    if (this._options === undefined) {
      this._options = this.createOptions();
      for (const option of this._options) {
        if (option instanceof RenderTargetCommand) {
          option.attach(renderTarget);
        }
      }
    }
    return this._options;
  }

  public get selectedOption(): BaseCommand | undefined {
    if (this._options === undefined) {
      return undefined;
    }
    return this._options.find((option) => option.isChecked);
  }
}
