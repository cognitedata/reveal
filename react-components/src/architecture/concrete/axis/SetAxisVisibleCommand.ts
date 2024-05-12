/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type Tooltip } from '../../base/commands/BaseCommand';
import { AxisDomainObject } from './AxisDomainObject';

export class SetAxisVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): Tooltip {
    return { key: 'UNKNOWN', fallback: 'Toggle axis visible' };
  }

  public get icon(): string {
    return 'Axis';
  }

  public override get isEnabled(): boolean {
    return true;
  }

  public get isCheckable(): boolean {
    return true;
  }

  public get isChecked(): boolean {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    const axis = rootDomainObject.getDescendantByType(AxisDomainObject);
    if (axis === undefined) {
      return false;
    }
    return axis.isVisible(renderTarget);
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    let axis = rootDomainObject.getDescendantByType(AxisDomainObject);
    if (axis === undefined) {
      axis = new AxisDomainObject();
      rootDomainObject.addChildInteractive(axis);
    }
    axis.toggleVisibleInteractive(renderTarget);
    return true;
  }
}
