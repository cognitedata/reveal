/*!
 * Copyright 2024 Cognite AS
 */

import { BaseOptionCommand } from '../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type TranslationInput } from '../utilities/TranslateInput';

const DEFAULT_OPTIONS = [0.5, 1, 2, 5, 10, 20];

export class KeyboardSpeedCommand extends BaseOptionCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(supportedTypes = DEFAULT_OPTIONS) {
    super();
    for (const value of supportedTypes) {
      this.add(new OptionItemCommand(value));
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'SET_FLY_SPEED' };
  }
}

// Note: This is not exported, as it is only used internally
class OptionItemCommand extends RenderTargetCommand {
  private readonly _value: number;

  public constructor(value: number) {
    super();
    this._value = value;
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: `${this._value.toString()}x` };
  }

  public override get isChecked(): boolean {
    return this._value === this.renderTarget.flexibleCameraManager.options.keyboardSpeed;
  }

  public override invokeCore(): boolean {
    this.renderTarget.flexibleCameraManager.options.keyboardSpeed = this._value;
    return true;
  }
}
