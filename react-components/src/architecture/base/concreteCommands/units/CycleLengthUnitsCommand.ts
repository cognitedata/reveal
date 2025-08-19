import { type IconName } from '../..utilities/types';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { LengthUnit } from '../../renderTarget/UnitSystem';
import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';

export class CycleLengthUnitsCommand extends RenderTargetCommand {
  public override get icon(): IconName {
    return 'RulerAlternative';
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: 'm/ft/in' }; // Note: m/ft/in do not need to be translated!
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.listenTo(this.rootDomainObject.unitSystem.lengthUnit);
  }

  protected override invokeCore(): boolean {
    // This command cycles through the length units: Meter -> Feet -> Inch -> Meter
    const unitSystem = this.rootDomainObject.unitSystem;
    switch (unitSystem.lengthUnit()) {
      case LengthUnit.Meter:
        unitSystem.lengthUnit(LengthUnit.Feet);
        break;

      case LengthUnit.Feet:
        unitSystem.lengthUnit(LengthUnit.Inch);
        break;

      default:
        unitSystem.lengthUnit(LengthUnit.Meter);
        break;
    }
    return true;
  }
}
