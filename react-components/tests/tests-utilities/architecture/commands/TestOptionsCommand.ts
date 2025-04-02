import {
  BaseOptionCommand,
  RenderTargetCommand,
  TranslateDelegate,
  TranslationInput
} from '../../../../src/architecture';

const OPTIONS = [0.5, 1, 2, 5, 10, 20];

export class TestOptionsCommand extends BaseOptionCommand {
  constructor(supportedTypes = OPTIONS) {
    super();
    for (const value of supportedTypes) {
      this.add(new TestOptionItemCommand(value));
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Test options' };
  }

  public override getLabel(t: TranslateDelegate): string {
    return t(this.tooltip);
  }
}

// Note: This is not exported, as it is only used internally
class TestOptionItemCommand extends RenderTargetCommand {
  private readonly _value: number;

  public constructor(value: number) {
    super();
    this._value = value;
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: `${this._value}` };
  }
}
