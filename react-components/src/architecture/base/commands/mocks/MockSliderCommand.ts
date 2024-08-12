/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../utilities/TranslateKey';
import { BaseSliderCommand } from '../BaseSliderCommand';

export class MockSliderCommand extends BaseSliderCommand {
  public _value = 5;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(1, 10, 1);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Slider' };
  }

  public override get value(): number {
    return this._value;
  }

  public override set value(value: number) {
    this._value = value;
  }
}
