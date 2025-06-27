import { BaseOptionCommand } from '../../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { LengthUnit, UnitSystem } from '../../renderTarget/UnitSystem';
import { Changes } from '../../domainObjectsHelpers/Changes';

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
    const unitSystem = this.rootDomainObject.unitSystem;
    return unitSystem.lengthUnit === this._value;
  }

  public override invokeCore(): boolean {
    const unitSystem = this.rootDomainObject.unitSystem;
    unitSystem.lengthUnit = this._value;
    this.rootDomainObject.notify(Changes.unit);
    this.rootDomainObject.notifyDescendants(Changes.unit);
    return true;
  }
}
