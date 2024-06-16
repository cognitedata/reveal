/*!
 * Copyright 2024 Cognite AS
 */

import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color, type Plane } from 'three';
import { BoxRenderStyle } from '../primitives/box/BoxRenderStyle';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ApplyClipCommand } from './commands/ApplyClipCommand';

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

    if (change.isChanged(Changes.deleted, Changes.added, Changes.geometry, Changes.selected)) {
      const root = this.rootDomainObject;
      if (root === undefined) {
        return;
      }
      const renderTarget = root.renderTarget;
      if (!renderTarget.isGlobalClippingActive) {
        return;
      }
      const isGlobalCropBox = renderTarget.isGlobalCropBox(this);

      if (isGlobalCropBox && change.isChanged(Changes.deleted)) {
        ApplyClipCommand.setClippingPlanes(root);
      } else if (isGlobalCropBox && change.isChanged(Changes.geometry)) {
        this.setGlobalCropBox();
      } else if (change.isChanged(Changes.selected) && this.isSelected) {
        this.setGlobalCropBox();
      } else if (isGlobalCropBox && change.isChanged(Changes.selected) && !this.isSelected) {
        ApplyClipCommand.setClippingPlanes(root);
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

  public setGlobalCropBox(): void {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return;
    }
    const planes = this.createClippingPlanes();
    root.renderTarget.setGlobalClipping(planes, this);
  }

  private createClippingPlanes(): Plane[] {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return [];
    }
    const matrix = this.getMatrix();
    return BoxFace.createClippingPlanes(matrix);
  }
}
