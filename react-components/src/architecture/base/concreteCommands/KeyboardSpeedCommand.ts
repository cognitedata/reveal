/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../commands/BaseCommand';
import { BaseOptionCommand } from '../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type TranslateKey } from '../utilities/TranslateKey';

const KEYBOARD_SPEED_VALUES = [0.5, 1, 2, 5, 10, 20];

export class KeyboardSpeedCommand extends BaseOptionCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'FLY_SPEED', fallback: 'Set fly speed on the camera' };
  }

  public override createOptions(): BaseCommand[] {
    const options: BaseCommand[] = [];
    for (const value of KEYBOARD_SPEED_VALUES) {
      options.push(new OptionCommand(value));
    }
    return options;
  }
}

// Note: This is not exported, as it is only used internally
class OptionCommand extends RenderTargetCommand {
  static currentSpeed: number = 1;
  private readonly _value;

  public constructor(value: number) {
    super();
    this._value = value;
  }

  public override get tooltip(): TranslateKey {
    return { fallback: this._value.toString() + 'x' };
  }

  public override get isChecked(): boolean {
    return this._value === this.renderTarget.flexibleCameraManager.options.keyboardSpeed;
  }

  public override invokeCore(): boolean {
    this.renderTarget.flexibleCameraManager.options.keyboardSpeed = this._value;
    return true;
  }
}
