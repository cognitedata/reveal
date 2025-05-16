/*!
 * Copyright 2024 Cognite AS
 */

import { BaseOptionCommand } from '../../../../src/architecture/base/commands/BaseOptionCommand';
import { RenderTargetCommand } from '../../../../src/architecture/base/commands/RenderTargetCommand';
import { type TranslationInput } from '../../../../src/architecture/base/utilities/TranslateInput';

export class MockNumberOptionCommand extends BaseOptionCommand {
  public value = 1;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor() {
    super();
    for (let value = 1; value <= 10; value++) {
      this.add(new OptionItemCommand(this, value));
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Number option' };
  }
}

// Note: This is not exported, as it is only used internally

class OptionItemCommand extends RenderTargetCommand {
  private readonly _value: number;
  private readonly _option: MockNumberOptionCommand;

  public constructor(option: MockNumberOptionCommand, value: number) {
    super();
    this._option = option;
    this._value = value;
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: this._value.toString() };
  }

  public override get isChecked(): boolean {
    return this._option.value === this._value;
  }

  public override invokeCore(): boolean {
    this._option.value = this._value;
    return true;
  }
}
