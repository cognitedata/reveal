/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { BaseCommand } from '../commands/BaseCommand';
import { type TranslateKey } from '../utilities/TranslateKey';

type GetStringDelegate = () => string;

export class CopyToClipboardCommand extends BaseCommand {
  private readonly _getStringDelegate: GetStringDelegate;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(getString: GetStringDelegate) {
    super();
    this._getStringDelegate = getString;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'COPY_TO_CLIPBOARD', fallback: 'Copy to clipboard' };
  }

  public override get icon(): string {
    return 'Copy';
  }

  public override get isEnabled(): boolean {
    return this._getStringDelegate !== undefined;
  }

  public override get hasData(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    const get = this._getStringDelegate;
    if (get === undefined) {
      return false;
    }
    navigator.clipboard
      .writeText(get())
      .then((_result) => {
        return true;
      })
      .catch((error) => {
        console.error(error);
      });
    return true;
  }
}
