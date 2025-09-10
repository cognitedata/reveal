import { type PointCloudDomainObject } from './PointCloudDomainObject';
import { type Box3 } from 'three';
import { ThreeView } from '../../../base/views/ThreeView';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type PointCloud } from '../RevealTypes';

export class PointCloudThreeView extends ThreeView<PointCloudDomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  private get model(): PointCloud {
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
    const pointCloud = this.model;
    super.onShow();
    pointCloud.visible = true;
  }

  public override onHide(): void {
    const pointCloud = this.model;
    pointCloud.visible = false;
    super.onHide();
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  protected override calculateBoundingBox(): Box3 {
    return this.domainObject.getBoundingBox();
  }
}
