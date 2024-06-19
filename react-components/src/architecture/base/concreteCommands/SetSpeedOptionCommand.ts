/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../commands/BaseCommand';
import { BaseOptionCommand } from '../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type TranslateKey } from '../utilities/TranslateKey';

export class SetSpeedOptionCommand extends BaseOptionCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'SPEED', fallback: 'Speed' };
  }

  public override createOptions(): BaseCommand[] {
    return [new SpeedCommand(1), new SpeedCommand(2), new SpeedCommand(4)];
  }
}

class SpeedCommand extends RenderTargetCommand {
  static currentSpeed: number = 1;
  private readonly _value;

  public constructor(value: number) {
    super();
    this._value = value;
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'x' + this._value.toString() };
  }

  public override get isChecked(): boolean {
    return this._value === SpeedCommand.currentSpeed;
  }

  public override invokeCore(): boolean {
    // this.renderTarget.flexibleCameraManager;
    SpeedCommand.currentSpeed = this._value;
    return true;
  }
}
