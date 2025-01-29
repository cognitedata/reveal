/*!
 * Copyright 2025 Cognite AS
 */

import { type PointCloudRenderStyle } from './PointCloudRenderStyle';
import { type DomainObjectChange } from '../../domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../domainObjectsHelpers/Changes';
import { type PointCloudDomainObject } from './PointCloudDomainObject';
import { ThreeView } from '../../views/ThreeView';
import { Box3 } from 'three';
import { type PointCloud } from '../RevealTypes';

export class PointCloudThreeView extends ThreeView<PointCloudDomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected override get style(): PointCloudRenderStyle {
    return super.style as PointCloudRenderStyle;
  }

  private get model(): PointCloud | undefined {
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
    if (pointCloud === undefined) {
      return;
    }
    super.onShow();
    pointCloud.visible = true;
  }

  public override onHide(): void {
    const pointCloud = this.model;
    if (pointCloud === undefined) {
      return;
    }
    pointCloud.visible = false;
    super.onHide();
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  protected override calculateBoundingBox(): Box3 {
    const pointCloud = this.model;
    if (pointCloud === undefined) {
      return new Box3().makeEmpty();
    }
    const boundingBox = new Box3();
    return pointCloud.getModelBoundingBox(boundingBox);
  }
}
