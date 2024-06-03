/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { AxisDomainObject } from './AxisDomainObject';

export class SetAxisVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'SHOW_OR_HIDE_AXIS', fallback: 'Show or hide axis' };
  }

  public override get icon(): string {
    return 'Axis3D';
  }

  public override get isEnabled(): boolean {
    return true;
  }

  public override get isCheckable(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    const { renderTarget, rootDomainObject } = this;

    const axis = rootDomainObject.getDescendantByType(AxisDomainObject);
    if (axis === undefined) {
      return false;
    }
    return axis.isVisible(renderTarget);
  }

  protected override invokeCore(): boolean {
    const { renderTarget, rootDomainObject } = this;

    let axis = rootDomainObject.getDescendantByType(AxisDomainObject);
    if (axis === undefined) {
      axis = new AxisDomainObject();
      rootDomainObject.addChildInteractive(axis);
    }
    axis.toggleVisibleInteractive(renderTarget);
    return true;
  }
}
