/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../../base/utilities/IconName';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { SliceDomainObject } from '../SliceDomainObject';
import { setClippingPlanes } from './setClippingPlanes';

export class NextOrPrevClippingCommand extends RenderTargetCommand {
  private readonly _next: boolean;

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(next: boolean) {
    super();
    this._next = next;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    if (this._next) {
      return {
        key: 'CLIP_NEXT'
      };
    } else {
      return {
        key: 'CLIP_PREV'
      };
    }
  }

  public override get icon(): IconName {
    return this._next ? 'ArrowRight' : 'ArrowLeft';
  }

  public override get isEnabled(): boolean {
    if (!this.renderTarget.isGlobalClippingActive) {
      return false;
    }
    const minimumCount = this._next ? 2 : 3; // Don't need both buttons if it is less than 3
    const { rootDomainObject } = this;
    // Require at least two crop boxes or one crop box and one slice
    let count = 0;
    for (const domainObject of rootDomainObject.getDescendants()) {
      if (domainObject instanceof CropBoxDomainObject) {
        count++;
        if (count >= minimumCount) {
          return true; // Optimization
        }
      }
    }
    if (rootDomainObject.getDescendantByType(SliceDomainObject) !== undefined) {
      count++;
    }
    return count >= minimumCount;
  }

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof NextOrPrevClippingCommand)) {
      return false;
    }
    return this._next === other._next;
  }

  protected override invokeCore(): boolean {
    // This code treat the slicing planes as one single group, along with all the crop boxes.
    // The next selected crop box or slicing planes will be used as clipping.
    const array = this.createCropBoxesAndSliceArray();
    if (array.length <= 1) {
      return false;
    }
    const selectedIndex = array.findIndex((domainObject) => domainObject.isSelected);
    if (selectedIndex === undefined) {
      return false;
    }
    const nextIndex = this.getNextIndex(selectedIndex, array.length);
    this.setAllInvisibleAndDeselected(array, nextIndex);

    // Take the next crop box or slicing planes and use it as clipping
    const nextCropBoxOrSlice = array[nextIndex];
    this.setVisibleAndSelected(nextCropBoxOrSlice, true);
    if (nextCropBoxOrSlice instanceof CropBoxDomainObject) {
      nextCropBoxOrSlice.setThisAsGlobalCropBox();
    } else {
      setClippingPlanes(this.rootDomainObject);
    }
    this.renderTarget.fitView();
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private createCropBoxesAndSliceArray(): Array<CropBoxDomainObject | SliceDomainObject> {
    const { rootDomainObject } = this;
    // Build the array of crop boxes and at least one slice
    const array = new Array<CropBoxDomainObject | SliceDomainObject>();
    for (const cropBox of rootDomainObject.getDescendantsByType(CropBoxDomainObject)) {
      array.push(cropBox);
    }
    // Take the selected slice, otherwise take the first one
    const selectedSlice = rootDomainObject.getSelectedDescendantByType(SliceDomainObject);
    if (selectedSlice !== undefined) {
      array.push(selectedSlice);
    } else {
      const sliceDomainObject = rootDomainObject.getDescendantByType(SliceDomainObject);
      if (sliceDomainObject !== undefined) {
        array.push(sliceDomainObject);
      }
    }
    return array;
  }

  private getNextIndex(selectedIndex: number, arrayLength: number): number {
    const increment = this._next ? 1 : -1;
    const nextIndex = selectedIndex + increment;
    if (nextIndex < 0) {
      return arrayLength - 1;
    } else if (nextIndex >= arrayLength) {
      return 0;
    }
    return nextIndex;
  }

  private setAllInvisibleAndDeselected(
    array: Array<CropBoxDomainObject | SliceDomainObject>,
    exceptIndex: number
  ): void {
    for (let i = 0; i < array.length; i++) {
      if (i !== exceptIndex) {
        this.setVisibleAndSelected(array[i], false);
      }
    }
  }

  private setVisibleAndSelected(
    domainObject: CropBoxDomainObject | SliceDomainObject,
    value: boolean
  ): void {
    domainObject.setSelectedInteractive(value);
    if (domainObject instanceof SliceDomainObject) {
      this.setAllSliceDomainObjectsVisible(value);
    } else {
      domainObject.setVisibleInteractive(value, this.renderTarget);
    }
  }

  private setAllSliceDomainObjectsVisible(visible: boolean): void {
    const { rootDomainObject } = this;
    for (const sliceDomainObject of rootDomainObject.getDescendantsByType(SliceDomainObject)) {
      sliceDomainObject.setVisibleInteractive(visible, this.renderTarget);
    }
  }

  public getCropBoxesAndSliceCount(): number {
    const { rootDomainObject } = this;
    // Require at least two crop boxes or one crop box and one slice
    let count = 0;
    for (const domainObject of rootDomainObject.getDescendants()) {
      if (domainObject instanceof CropBoxDomainObject) {
        count++;
      }
    }
    if (rootDomainObject.getDescendantByType(SliceDomainObject) !== undefined) {
      count++;
    }
    return count;
  }
}
