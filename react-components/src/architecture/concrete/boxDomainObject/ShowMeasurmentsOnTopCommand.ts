/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type Tooltip } from '../../base/commands/BaseCommand';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { getAnyMeasureDomainObject, getMeasureDomainObjects } from './MeasurementFunctions';

export class ShowMeasurmentsOnTopCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): Tooltip {
    return { key: 'MEASUREMENTS_SHOW_ON_TOP', fallback: 'Show all measurements on top' };
  }

  public override get icon(): string {
    return 'Expand';
  }

  public override get isEnabled(): boolean {
    const domainObject = getAnyMeasureDomainObject(this.renderTarget);
    return domainObject !== undefined;
  }

  public override get isCheckable(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    const domainObject = getAnyMeasureDomainObject(this.renderTarget);
    if (domainObject === undefined) {
      return false;
    }
    const style = domainObject.renderStyle;
    return style.depthTest;
  }

  protected override invokeCore(): boolean {
    const isChecked = this.isChecked;
    for (const domainObject of getMeasureDomainObjects(this.renderTarget)) {
      const style = domainObject.renderStyle;
      style.depthTest = !isChecked;
      domainObject.notify(Changes.renderStyle);
    }
    return true;
  }
}
