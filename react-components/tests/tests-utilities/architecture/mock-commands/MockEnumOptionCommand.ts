/*!
 * Copyright 2024 Cognite AS
 */

import { BaseOptionCommand } from '../../../../src/architecture/base/commands/BaseOptionCommand';
import { RenderTargetCommand } from '../../../../src/architecture/base/commands/RenderTargetCommand';
import { type TranslationInput } from '../../../../src/architecture/base/utilities/TranslateInput';

enum MockEnum {
  Red = 'Red',
  Green = 'Green',
  Blue = 'Blue'
}

export class MockEnumOptionCommand extends BaseOptionCommand {
  public value = MockEnum.Red;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor() {
    super();
    for (const value of [MockEnum.Red, MockEnum.Green, MockEnum.Blue]) {
      this.add(new OptionItemCommand(this, value));
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Enum option' };
  }
}

// Note: This is not exported, as it is only used internally

class OptionItemCommand extends RenderTargetCommand {
  private readonly _value: MockEnum;
  private readonly _option: MockEnumOptionCommand;

  public constructor(option: MockEnumOptionCommand, value: MockEnum) {
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
