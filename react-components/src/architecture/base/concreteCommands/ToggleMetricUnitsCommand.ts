/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../../components/Architecture/getIconComponent';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type TranslateKey } from '../utilities/TranslateKey';

export class ToggleMetricUnitsCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'RulerAlternative';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'TOGGLE_METRIC_UNITS', fallback: 'm/ft' }; // Note: m/ft do not need to be translated!
  }

  public override get isChecked(): boolean {
    return this.rootDomainObject.unitSystem.isMetric;
  }

  protected override invokeCore(): boolean {
    const unitSystem = this.rootDomainObject.unitSystem;
    unitSystem.isMetric = !unitSystem.isMetric;
    this.rootDomainObject.notifyDescendants(Changes.unit);
    return true;
  }
}
