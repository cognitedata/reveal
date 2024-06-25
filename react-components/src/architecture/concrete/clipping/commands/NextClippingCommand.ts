/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';
import { ApplyClipCommand } from './ApplyClipCommand';

export class NextClippingCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return {
      key: 'CLIP_NEXT',
      fallback: 'Set the next crop box or slicing plane as global clipping'
    };
  }

  public override get icon(): string {
    return 'ArrowRight';
  }

  public override get isEnabled(): boolean {
    if (!this.renderTarget.isGlobalClippingActive) {
      return false;
    }
    // Require at least two crop boxes or one crop box and one slice
    let count = 0;
    for (const domainObject of this.rootDomainObject.getDescendants()) {
      if (domainObject instanceof CropBoxDomainObject) {
        count++;
      }
    }
    if (this.rootDomainObject.getDescendantByType(SliceDomainObject) !== undefined) {
      count++;
    }
    return count >= 2;
  }

  protected override invokeCore(): boolean {
    // This code treat the slicing planes as one single group, along with all the crop boxes.
    // The next selected crop box or slicing planes will be used as clipping.
    const { renderTarget } = this;

    const selectedSlice = this.rootDomainObject.getSelectedDescendantByType(SliceDomainObject);
    if (selectedSlice !== undefined) {
      // If any slice is selected, use the first crop box as clipping
      selectedSlice.setSelectedInteractive(false);
      const cropBox = this.rootDomainObject.getDescendantByType(CropBoxDomainObject);
      if (cropBox !== undefined) {
        cropBox.setSelectedInteractive(true);
        cropBox.setThisAsGlobalCropBox();
        renderTarget.fitView();
        return true;
      }
    }
    // Build the array of crop boxes and at least one slice
    const array: DomainObject[] = [];
    let haveSlice = false;
    let selectedIndex: number | undefined;
    for (const domainObject of this.rootDomainObject.getDescendants()) {
      if (domainObject instanceof CropBoxDomainObject) {
        if (domainObject.isSelected) {
          selectedIndex = array.length;
        }
        array.push(domainObject);
      } else if (!haveSlice && domainObject instanceof SliceDomainObject) {
        if (domainObject.isSelected) {
          selectedIndex = array.length;
        }
        array.push(domainObject);
        haveSlice = true;
      }
    }
    if (array.length <= 1 || selectedIndex === undefined) {
      return false;
    }
    // Turn all selection off
    for (let i = 0; i < array.length; i++) {
      const domainObject = array[i];
      domainObject.setSelectedInteractive(false);
    }
    // Select the next crop box or slicing planes and use it as clipping
    selectedIndex = (selectedIndex + 1) % array.length;
    for (let i = 0; i < array.length; i++) {
      const domainObject = array[i];
      if (i !== selectedIndex) {
        continue;
      }
      domainObject.setSelectedInteractive(true);
      if (domainObject instanceof CropBoxDomainObject) {
        domainObject.setThisAsGlobalCropBox();
      } else {
        ApplyClipCommand.setClippingPlanes(this.rootDomainObject);
      }
      renderTarget.fitView();
      break;
    }
    return true;
  }
}
