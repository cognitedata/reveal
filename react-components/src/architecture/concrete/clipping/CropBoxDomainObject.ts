import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { BoxFace } from '../primitives/common/BoxFace';
import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color, type Plane } from 'three';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { setClippingPlanes } from './commands/setClippingPlanes';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type IconName } from '../../base/utilities/IconName';
import { SolidPrimitiveRenderStyle } from '../primitives/common/SolidPrimitiveRenderStyle';
import { getRenderTarget, getRoot } from '../../base/domainObjects/getRoot';

export class CropBoxDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.color = new Color(Color.NAMES.orange);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'Crop';
  }

  public override get typeName(): TranslationInput {
    return { key: 'CROP_BOX' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new SolidPrimitiveRenderStyle();
    style.showLabel = false;
    return style;
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    if (
      change.isChanged(
        Changes.selected,
        Changes.deleted,
        Changes.added,
        Changes.geometry,
        Changes.dragging
      )
    ) {
      if (change.isChanged(Changes.deleted)) {
        this.focusType = FocusType.Pending; // Make sure that the crop box is not used in clipping anymore
      }
      this.updateClippingPlanes(change);
    }
  }

  public override get useClippingInIntersection(): boolean {
    return false;
  }

  public override get hasBoldLabel(): boolean {
    const renderTarget = getRenderTarget(this);
    if (renderTarget === undefined) {
      return false;
    }
    if (!renderTarget.isGlobalClippingActive) {
      return false;
    }
    return renderTarget.isGlobalCropBox(this);
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new CropBoxDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public setThisAsGlobalCropBox(): void {
    const root = getRoot(this);
    if (root === undefined) {
      return;
    }
    if (this.focusType === FocusType.Pending) {
      // Fallback to default. Do not use any pending objects in clipping
      setClippingPlanes(root);
      return;
    }
    const planes = this.createClippingPlanes();
    root.renderTarget.setGlobalClipping(planes, this);
  }

  private createClippingPlanes(): Plane[] {
    const root = getRoot(this);
    if (root === undefined) {
      return [];
    }
    const matrix = this.box.getMatrix();
    return BoxFace.createClippingPlanes(matrix);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private updateClippingPlanes(change: DomainObjectChange): void {
    // Update the clipping planes if necessary
    const root = getRoot(this);
    if (root === undefined) {
      return;
    }
    const renderTarget = root.renderTarget;
    if (!renderTarget.isGlobalClippingActive) {
      return;
    }
    const isGlobalCropBox = renderTarget.isGlobalCropBox(this);
    if (isGlobalCropBox) {
      if (
        change.isChanged(Changes.deleted) ||
        (change.isChanged(Changes.selected) && !this.isSelected)
      ) {
        setClippingPlanes(root);
        return;
      }
    }
    if (
      (isGlobalCropBox || this.isSelected) &&
      change.isChanged(Changes.geometry, Changes.dragging)
    ) {
      this.setThisAsGlobalCropBox();
    } else if (change.isChanged(Changes.selected) && this.isSelected) {
      this.setThisAsGlobalCropBox();
    }
  }
}
