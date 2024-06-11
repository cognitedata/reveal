/*!
 * Copyright 2024 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxDomainObject } from '../box/BoxDomainObject';
import { Color } from 'three';

export const MIN_BOX_SIZE = 0.01;

export class CropBoxDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.color = new Color(Color.NAMES.blue);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return 'Crop';
  }

  public override get typeName(): string {
    return 'Crop box';
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    if (this.isUseAsCropBox) {
      if (change.isChanged(Changes.deleted)) {
        this.setUseAsCropBox(false);
      }
      if (change.isChanged(Changes.geometry)) {
        this.setUseAsCropBox(true);
      }
    } else if (change.isChanged(Changes.selected) && this.isSelected) {
      const root = this.rootDomainObject;
      if (root !== undefined && root.renderTarget.isGlobalCropBoxActive) {
        this.setUseAsCropBox(true);
      }
    }
  }
  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public get isUseAsCropBox(): boolean {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return false;
    }
    return root.renderTarget.isGlobalCropBox(this);
  }

  public setUseAsCropBox(use: boolean): void {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return;
    }
    if (!use) {
      root.renderTarget.clearGlobalCropBox();
    } else {
      const boundingBox = this.getBoundingBox();
      boundingBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
      const matrix = this.getMatrix();
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
      const planes = BoxFace.createClippingPlanes(matrix);
      root.renderTarget.setGlobalCropBox(planes, boundingBox, this);
    }
  }
}
