/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { CropBoxDomainObject } from './CropBoxDomainObject';

export class SetCropBoxCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'CROP_BOX', fallback: 'Set as crop box' };
  }

  public override get icon(): string {
    return 'Crop';
  }

  public override get isEnabled(): boolean {
    if (this.renderTarget.isGlobalCropBoxActive) {
      return true;
    }
    return this.getCropBoxDomainObject() !== undefined;
  }

  public override get isChecked(): boolean {
    return this.renderTarget.isGlobalCropBoxActive;
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    const domainObject = this.getCropBoxDomainObject();
    if (domainObject === undefined || this.renderTarget.isGlobalCropBoxActive) {
      renderTarget.clearGlobalCropBox();
      return false;
    }
    if (domainObject.isUseAsCropBox) {
      renderTarget.clearGlobalCropBox();
      return true;
    }
    domainObject.setUseAsCropBox(true);
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
