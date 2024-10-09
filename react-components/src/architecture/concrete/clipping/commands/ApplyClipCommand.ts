/*!
 * Copyright 2024 Cognite AS
 */

import { type Plane } from 'three';
import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';
import { type RootDomainObject } from '../../../base/domainObjects/RootDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type IconName } from '../../../base/utilities/IconName';

export class ApplyClipCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return {
      key: 'CLIP_APPLY',
      fallback: 'Apply selected crop box to a model. Otherwise, apply to all slice planes'
    };
  }

  public override get icon(): IconName {
    return 'Crop';
  }

  public override get buttonType(): string {
    return 'primary';
  }

  public override get isEnabled(): boolean {
    const cropBox = this.getSelectedCropBoxDomainObject();
    if (cropBox !== undefined) {
      return cropBox.focusType !== FocusType.Pending;
    }
    if (this.rootDomainObject.getDescendantByType(SliceDomainObject) !== undefined) {
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
      ApplyClipCommand.setClippingPlanes(this.rootDomainObject);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getSelectedCropBoxDomainObject(): CropBoxDomainObject | undefined {
    return this.rootDomainObject.getSelectedDescendantByType(CropBoxDomainObject);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public static setClippingPlanes(root: RootDomainObject): boolean {
    const planes: Plane[] = [];
    for (const sliceDomainObject of root.getDescendantsByType(SliceDomainObject)) {
      const plane = sliceDomainObject.plane.clone();
      if (sliceDomainObject.focusType === FocusType.Pending) {
        continue; // Do not use any pending objects in clipping
      }
      planes.push(plane);
    }
    root.renderTarget.setGlobalClipping(planes);
    return true;
  }
}
