/*!
 * Copyright 2024 Cognite AS
 */
import { Box3 } from 'three';
import { type ObservationsDomainObject } from './ObservationsDomainObject';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { type CustomObjectIntersectInput, type CustomObjectIntersection } from '@cognite/reveal';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { DEFAULT_OVERLAY_COLOR, SELECTED_OVERLAY_COLOR } from './constants';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';

export class ObservationsView extends GroupThreeView<ObservationsDomainObject> {
  protected override calculateBoundingBox(): Box3 {
    return this.domainObject.overlayCollection
      .getOverlays()
      .reduce((box, overlay) => box.expandByPoint(overlay.getPosition()), new Box3());
  }

  protected override addChildren(): void {
    this.addChild(this.domainObject.overlayCollection);
  }

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.selected)) {
      this.domainObject.overlayCollection.getOverlays().forEach((overlay) => {
        overlay.setColor(DEFAULT_OVERLAY_COLOR);
      });

      const overlay = this.domainObject.getSelectedOverlay();
      overlay?.setColor(SELECTED_OVERLAY_COLOR);

      this.renderTarget.invalidate();
    }
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { domainObject } = this;

    const intersection = this.domainObject.overlayCollection.intersectOverlays(
      intersectInput.normalizedCoords,
      intersectInput.camera
    );

    if (intersection === undefined) {
      return undefined;
    }

    const point = intersection.getPosition();

    const distanceToCamera = point.distanceTo(intersectInput.raycaster.ray.origin);
    if (closestDistance !== undefined && closestDistance < distanceToCamera) {
      return undefined;
    }

    if (domainObject.useClippingInIntersection && !intersectInput.isVisible(point)) {
      return undefined;
    }

    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera,
      customObject: this,
      domainObject
    };

    if (this.shouldPickBoundingBox) {
      customObjectIntersection.boundingBox = this.boundingBox;
    }
    return customObjectIntersection;
  }
}
