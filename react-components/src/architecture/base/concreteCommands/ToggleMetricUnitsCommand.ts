import { type IconName } from '../../base/utilities/IconName';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type TranslationInput } from '../utilities/TranslateInput';

export class ToggleMetricUnitsCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'RulerAlternative';
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: 'm/ft' }; // Note: m/ft do not need to be translated!
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.rootDomainObject.unitSystem.isMetric;
  }

  protected override invokeCore(): boolean {
    const unitSystem = this.rootDomainObject.unitSystem;
    unitSystem.isMetric = !unitSystem.isMetric;
    this.rootDomainObject.notify(Changes.unit);
    this.rootDomainObject.notifyDescendants(Changes.unit);
    return true;
  }
}
