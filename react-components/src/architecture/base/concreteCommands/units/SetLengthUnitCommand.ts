import { BaseOptionCommand } from '../../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { LengthUnit, UnitSystem } from '../../renderTarget/UnitSystem';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';

export class SetLengthUnitCommand extends BaseOptionCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor() {
    super();
    for (const value of [LengthUnit.Meter, LengthUnit.Feet, LengthUnit.Inch]) {
      this.add(new OptionItemCommand(value));
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'UNITS' };
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.listenTo(this.rootDomainObject.unitSystem.lengthUnit);
  }
}

class OptionItemCommand extends RenderTargetCommand {
  private readonly _value: LengthUnit;

  public constructor(value: LengthUnit) {
    super();
    this._value = value;
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: UnitSystem.getFullTextForLengthUnit(this._value) };
  }

  public override get isChecked(): boolean {
    return this.rootDomainObject.unitSystem.lengthUnit() === this._value;
  }

  public override invokeCore(): boolean {
    this.rootDomainObject.unitSystem.lengthUnit(this._value);
    return true;
  }
}
