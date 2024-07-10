/*!
 * Copyright 2024 Cognite AS
 */
import { Box3 } from 'three';
import { type ObservationsDomainObject } from './ObservationsDomainObject';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { type CustomObjectIntersectInput, type CustomObjectIntersection } from '@cognite/reveal';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { isDefined } from '../../../utilities/isDefined';
import { first, sortBy } from 'lodash';
import { ObservationOverlay } from './types';
import { getColorFromStatus } from './ObservationStatus';

export class ObservationsView extends GroupThreeView<ObservationsDomainObject> {
  protected override calculateBoundingBox(): Box3 {
    return this.domainObject.overlayCollections
      .flatMap<ObservationOverlay>((collection) => collection.getOverlays())
      .reduce((box, overlay) => box.expandByPoint(overlay.getPosition()), new Box3());
  }

  protected override addChildren(): void {
    this.domainObject.overlayCollections.forEach((collection) => this.addChild(collection));
  }

  public override update(change: DomainObjectChange): void {
    super.update(change);

    if (change.isChanged(Changes.selected, Changes.geometry)) {
      const selectedOverlay = this.domainObject.getSelectedOverlay();
      const overlayCollections = this.domainObject.overlayCollections;

      overlayCollections.forEach((collection) => {
        const overlays = collection.getOverlays();
        overlays.forEach((overlay) => {
          const isSelected = selectedOverlay === overlay;
          const observationStatus = this.domainObject.getObservationStatus(overlay);

          const color = getColorFromStatus(observationStatus, isSelected);
          if (!color.equals(overlay.getColor())) {
            overlay.setColor(color);
          }
        });
      });
    }

    this.renderTarget.invalidate();
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { domainObject } = this;

    const intersections = this.domainObject.overlayCollections
      .map((collection) =>
        collection.intersectOverlays(intersectInput.normalizedCoords, intersectInput.camera)
      )
      .filter(isDefined);

    const closestIntersection = first(
      sortBy(intersections, (intersection) =>
        this.renderTarget.camera.position.distanceToSquared(intersection.getPosition())
      )
    );

    if (closestIntersection === undefined) {
      return undefined;
    }

    const point = closestIntersection.getPosition();

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
