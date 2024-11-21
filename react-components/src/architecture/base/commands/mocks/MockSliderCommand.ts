/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslationInput } from '../../utilities/TranslateInput';
import { FractionSliderCommand } from '../FractionSliderCommand';

export class MockSliderCommand extends FractionSliderCommand {
  public _value = 0.5;

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Slider' };
  }

  public override get value(): number {
    return this._value;
  }

  public override set value(value: number) {
    this._value = value;
  }
}
