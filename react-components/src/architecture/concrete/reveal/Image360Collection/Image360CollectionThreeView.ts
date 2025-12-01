import { type Image360CollectionDomainObject } from './Image360CollectionDomainObject';
import { type Box3 } from 'three';
import { ThreeView } from '../../../base/views/ThreeView';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type Image360Model } from '../RevealTypes';

export class Image360CollectionThreeView extends ThreeView<Image360CollectionDomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): Image360Model {
    const domainObject = this.domainObject;
    return domainObject.model;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.renderStyle)) {
      this.invalidateRenderTarget();
    }
  }

  public override onShow(): void {
    const model = this.model;
    super.onShow();
    model.setIconsVisibility(true);
  }

  public override onHide(): void {
    const model = this.model;
    model.setIconsVisibility(false);
    super.onHide();
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  protected override calculateBoundingBox(): Box3 {
    return this.domainObject.getBoundingBox();
  }
}
