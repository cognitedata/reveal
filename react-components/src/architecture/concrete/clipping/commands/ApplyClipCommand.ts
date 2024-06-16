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

export class ApplyClipCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return {
      key: 'CLIP_APPLY',
      fallback: 'Apply selected crop box to the model if any, otherwise apply all slice planes'
    };
  }

  public override get icon(): string {
    return 'Crop';
  }

  public override get isEnabled(): boolean {
    if (this.getSelectedCropBoxDomainObject() !== undefined) {
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
      return true;
    }
    const cropBox = this.getSelectedCropBoxDomainObject();
    if (cropBox !== undefined) {
      cropBox.setThisAsGlobalCropBox();
    } else {
      ApplyClipCommand.setClippingPlanes(this.rootDomainObject);
    }
    renderTarget.fitView();
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

  public static setClippingPlanes(root: RootDomainObject, except?: SliceDomainObject): boolean {
    const planes: Plane[] = [];
    for (const sliceDomainObject of root.getDescendantsByType(SliceDomainObject)) {
      const plane = sliceDomainObject.plane.clone();
      if (except !== undefined && sliceDomainObject === except) {
        continue;
      }
      if (sliceDomainObject.focusType === FocusType.Pending) {
        continue; // Do not use pending any objects
      }
      planes.push(plane);
    }
    root.renderTarget.setGlobalClipping(planes);
    return true;
  }
}
