import { type IconName } from '../../base/utilities/IconName';
import { type TranslationInput } from '../utilities/TranslateInput';
import { InstanceCommand } from './InstanceCommand';

export abstract class ShowAllDomainObjectsCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Show or hide' };
  }

  public override get icon(): IconName {
    return 'EyeShow';
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.isAnyVisible();
  }

  protected override invokeCore(): boolean {
    const isVisible = this.isAnyVisible();
    for (const domainObject of this.getInstances()) {
      domainObject.setVisibleInteractive(!isVisible, this.renderTarget);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private isAnyVisible(): boolean {
    for (const domainObject of this.getInstances()) {
      if (domainObject.isVisible(this.renderTarget)) {
        return true;
      }
    }
    return false;
  }
}
