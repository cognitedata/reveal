/*!
 * Copyright 2024 Cognite AS
 */
import { Box3 } from 'three';
import { type ObservationsDomainObject } from './ObservationsDomainObject';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { DomainObject } from '../../base/domainObjects/DomainObject';
import {
  AnyIntersection,
  CustomObjectIntersectInput,
  CustomObjectIntersection,
  ICustomObject
} from '@cognite/reveal';
import { ThreeView } from '../../base/views/ThreeView';
import { DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';

export class ObservationsView extends GroupThreeView<ObservationsDomainObject> {
  protected override calculateBoundingBox(): Box3 {
    return this.domainObject.overlayCollection
      .getOverlays()
      .reduce((box, overlay) => box.expandByPoint(overlay.getPosition()), new Box3());
  }

  protected override addChildren(): void {
    this.addChild(this.domainObject.overlayCollection);
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
