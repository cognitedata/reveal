/*!
 * Copyright 2024 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color, type Plane } from 'three';
import { BoxRenderStyle } from '../primitives/box/BoxRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type TranslateKey } from '../../base/utilities/TranslateKey';

export class CropBoxDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.color = new Color(Color.NAMES.orange);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return 'Crop';
  }

  public override get typeName(): TranslateKey {
    return { key: 'CROP_BOX', fallback: 'Crop box' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new BoxRenderStyle();
    style.showLabel = false;
    return style;
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    if (this.isGlobalCropBox) {
      if (change.isChanged(Changes.deleted)) {
        this.isGlobalCropBox = false;
      }
      if (change.isChanged(Changes.geometry)) {
        this.isGlobalCropBox = true;
      }
    } else if (change.isChanged(Changes.selected) && this.isSelected) {
      const root = this.rootDomainObject;
      if (root !== undefined && root.renderTarget.isGlobalCropBoxActive) {
        this.isGlobalCropBox = true;
      }
    }
  }

  // ==================================================
  // OVERRIDES of BoxDomainObject
  // ==================================================

  public override get useClippingInIntersection(): boolean {
    return false;
  }

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public get isGlobalCropBox(): boolean {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return false;
    }
    return root.renderTarget.isGlobalCropBox(this);
  }

  public set isGlobalCropBox(value: boolean) {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return;
    }
    if (!value) {
      root.renderTarget.clearGlobalClipping();
    } else {
      const planes = this.getPlanes();
      const boundingBox = this.getBoundingBox();
      boundingBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
      root.renderTarget.setGlobalClipping(planes, boundingBox, this);
    }
  }

  public getPlanes(): Plane[] {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return [];
    }
    const matrix = this.getMatrix();
    matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return BoxFace.createClippingPlanes(matrix);
  }
}
