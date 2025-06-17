import { type IconName } from '../../utilities/IconName';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { Changes } from '../../domainObjectsHelpers/Changes';
import { LengthUnit } from '../../renderTarget/UnitSystem';
import { type TranslationInput } from '../../utilities/TranslateInput';

export class ChangeLengthUnitCommand extends RenderTargetCommand {
  public override get icon(): IconName {
    return 'RulerAlternative';
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: 'm/ft/in' }; // Note: m/ft/in do not need to be translated!
  }

  protected override invokeCore(): boolean {
    const unitSystem = this.rootDomainObject.unitSystem;
    switch (unitSystem.lengthUnit) {
      case LengthUnit.Meter:
        unitSystem.lengthUnit = LengthUnit.Feet;
        break;

      case LengthUnit.Feet:
        unitSystem.lengthUnit = LengthUnit.Inch;
        break;

      default:
        unitSystem.lengthUnit = LengthUnit.Meter;
        break;
    }
    this.rootDomainObject.notify(Changes.unit);
    this.rootDomainObject.notifyDescendants(Changes.unit);
    return true;
  }
}
