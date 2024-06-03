/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { MeasureType } from './MeasureType';

// Experimental code for crop box

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
    return this.getMeasureBoxDomainObject() !== undefined;
  }

  public override get isCheckable(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.renderTarget.isGlobalCropBoxActive;
  }

  protected override invokeCore(): boolean {
    const { renderTarget } = this;
    const domainObject = this.getMeasureBoxDomainObject();
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

  private getMeasureBoxDomainObject(): MeasureBoxDomainObject | undefined {
    const domainObject = this.rootDomainObject.getSelectedDescendantByType(MeasureBoxDomainObject);
    if (domainObject === undefined) {
      return undefined;
    }
    if (domainObject.measureType !== MeasureType.Volume) {
      return undefined;
    }
    return domainObject;
  }
}
