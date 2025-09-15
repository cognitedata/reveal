import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type TranslationInput } from '../../../base/utilities/translation/TranslateInput';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type IconName, type ButtonType } from '../../../base/utilities/types';
import { setClippingPlanes } from './setClippingPlanes';

export class ApplyClipCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return {
      key: 'CLIP_APPLY'
    };
  }

  public override get icon(): IconName {
    return 'Crop';
  }

  public override get buttonType(): ButtonType {
    return 'primary';
  }

  public override get isEnabled(): boolean {
    const cropBox = this.getSelectedCropBoxDomainObject();
    if (cropBox !== undefined) {
      return cropBox.focusType !== FocusType.Pending;
    }
    if (this.root.getDescendantByType(SliceDomainObject) !== undefined) {
      return true;
    }
    return false;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.renderTarget.isGlobalClippingActive;
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    if (this.renderTarget.isGlobalClippingActive) {
      renderTarget.clearGlobalClipping();
      return true;
    }
    const cropBox = this.getSelectedCropBoxDomainObject();
    if (cropBox !== undefined) {
      if (cropBox.focusType !== FocusType.Pending) {
        cropBox.setThisAsGlobalCropBox();
        renderTarget.fitView();
      }
    } else {
      setClippingPlanes(this.root);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getSelectedCropBoxDomainObject(): CropBoxDomainObject | undefined {
    return this.root.getSelectedDescendantByType(CropBoxDomainObject);
  }
}
