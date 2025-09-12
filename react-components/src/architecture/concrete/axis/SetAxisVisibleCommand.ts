import { type IconName } from '../../base/utilities/types';
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type TranslationInput } from '../../base/utilities/translation/TranslateInput';
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
    const { renderTarget, root } = this;

    const axis = root.getDescendantByType(AxisDomainObject);
    if (axis === undefined) {
      return false;
    }
    return axis.isVisible(renderTarget);
  }

  protected override invokeCore(): boolean {
    const { renderTarget, root } = this;

    let axis = root.getDescendantByType(AxisDomainObject);
    if (axis === undefined) {
      axis = new AxisDomainObject();
      root.addChildInteractive(axis);
    }
    axis.toggleVisibleInteractive(renderTarget);
    return true;
  }
}
