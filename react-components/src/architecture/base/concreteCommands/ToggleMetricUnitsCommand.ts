/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type TranslateKey } from '../utilities/TranslateKey';

export class ToggleMetricUnitsCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return 'RulerAlternative';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'TOGGLE_METRIC_UNITS', fallback: 'm/ft' }; // Note: m/ft do not need to be translated!
  }

  public override get isChecked(): boolean {
    const { renderTarget } = this;
    return renderTarget.rootDomainObject.unitSystem.isMetric;
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    const unitSystem = renderTarget.rootDomainObject.unitSystem;
    unitSystem.isMetric = !unitSystem.isMetric;
    renderTarget.rootDomainObject.notifyDescendants(Changes.unit);
    return true;
  }
}
