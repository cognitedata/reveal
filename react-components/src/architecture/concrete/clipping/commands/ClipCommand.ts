/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';

export class ClipCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'CROP_BOX', fallback: 'Apply slicing and selected crop box to the model' };
  }

  public override get icon(): string {
    return 'Crop';
  }

  public override get isEnabled(): boolean {
    if (this.getCropBoxDomainObject() !== undefined) {
      return true;
    }
    if (this.rootDomainObject.getDescendantByType(SliceDomainObject) !== undefined) {
      return true;
    }
    return false;
  }

  public override get isChecked(): boolean {
    return this.renderTarget.isGlobalClippingActive;
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    if (this.renderTarget.isGlobalClippingActive) {
      renderTarget.clearGlobalClipping();
      return false;
    }
    const domainObject = this.getCropBoxDomainObject();
    if (domainObject === undefined) {
      return false;
    }
    domainObject.isGlobalCropBox = true;
    renderTarget.fitView();
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getCropBoxDomainObject(): CropBoxDomainObject | undefined {
    return this.rootDomainObject.getSelectedDescendantByType(CropBoxDomainObject);
  }
}
