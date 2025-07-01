import { type IconName } from '../../../base/utilities/IconName';
import { InstanceCommand } from '../../../base/commands/InstanceCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';

export class ShowAllClippingCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return {
      key: 'CLIP_SHOW_SELECTED_ONLY'
    };
  }

  public override get icon(): IconName {
    return 'EyeShow';
  }

  public override get isChecked(): boolean {
    return this.isAnyVisible();
  }

  protected override invokeCore(): boolean {
    const isVisible = this.isAnyVisible();
    for (const domainObject of this.getInstances()) {
      if (domainObject.isSelected) {
        continue;
      }
      domainObject.setVisibleInteractive(!isVisible, this.renderTarget);
    }
    return true;
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject || domainObject instanceof SliceDomainObject;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private isAnyVisible(): boolean {
    for (const domainObject of this.getInstances()) {
      if (domainObject.isSelected) {
        continue;
      }
      if (domainObject.isVisible(this.renderTarget)) {
        return true;
      }
    }
    return false;
  }
}
