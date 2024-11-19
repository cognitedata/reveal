/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../base/utilities/IconName';
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { AxisDomainObject } from './AxisDomainObject';

export class SetAxisVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'SHOW_OR_HIDE_AXIS' };
  }

  public override get icon(): IconName {
    return 'Axis3D';
  }

  public override get isEnabled(): boolean {
    return true;
  }

  public override get isToggle(): boolean {
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
