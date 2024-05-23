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
    return 'EyeShow';
  }

  public override get isEnabled(): boolean {
    const domainObject = getAnyMeasureDomainObject(this.renderTarget);
    return domainObject !== undefined;
  }

  public override get isCheckable(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return !this.getDepthTest();
  }

  protected override invokeCore(): boolean {
    const depthTest = this.getDepthTest();
    for (const domainObject of getMeasureDomainObjects(this.renderTarget)) {
      const style = domainObject.renderStyle;
      style.depthTest = !depthTest;
      domainObject.notify(Changes.renderStyle);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getDepthTest(): boolean {
    const domainObject = getAnyMeasureDomainObject(this.renderTarget);
    if (domainObject === undefined) {
      return false;
    }
    const style = domainObject.renderStyle;
    return style.depthTest;
  }
}
