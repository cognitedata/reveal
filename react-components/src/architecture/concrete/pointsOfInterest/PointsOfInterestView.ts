import { Box3, Vector3 } from 'three';
import { type PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  Overlay3DCollection,
  type OverlayInfo,
  type CustomObjectIntersectInput,
  type CustomObjectIntersection,
  ClosestGeometryFinder,
  isPointVisibleByPlanes
} from '@cognite/reveal';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { createPointsOfInterestIntersection, type PointOfInterest } from './types';
import { getColorFromStatus } from './color';

type PointsOfInterestCollection<PoiIdType> = Overlay3DCollection<PointOfInterest<PoiIdType>>;

export class PointsOfInterestView<PoiIdType> extends GroupThreeView<
  PointsOfInterestDomainObject<PoiIdType>
> {
  private readonly _overlayCollection: PointsOfInterestCollection<PoiIdType> =
    new Overlay3DCollection([], { maxPointSize: 32 });

  protected override calculateBoundingBox(): Box3 {
    const boundingBox = new Box3().makeEmpty();
    for (const overlay of this._overlayCollection.getOverlays()) {
      if (overlay.getVisible()) {
        boundingBox.expandByPoint(overlay.getPosition());
      }
    }
    return boundingBox;
  }

  protected override addChildren(): void {
    const pois = this.domainObject.pointsOfInterest;

    const selectedPointsOfInterest = this.domainObject.selectedPointsOfInterest;
    const overlayInfos = createPointsOfInterestOverlays(pois, selectedPointsOfInterest);
    this._overlayCollection.removeAllOverlays();

    this._overlayCollection.addOverlays(overlayInfos);
    this.updateClipping();

    this.addChild(this._overlayCollection);
  }

  public override update(change: DomainObjectChange): void {
    super.update(change);

    if (change.isChanged(Changes.geometry, Changes.dragging)) {
      this.clearMemory();
      this.invalidateRenderTarget();
      this.invalidateBoundingBox();
    } else if (change.isChanged(Changes.clipping)) {
      this.updateClipping();
      this.invalidateRenderTarget();
      this.invalidateBoundingBox();
    } else if (change.isChanged(Changes.selected)) {
      this.updateColors();
      this.invalidateRenderTarget();
    }
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { domainObject } = this;

    const closestFinder = new ClosestGeometryFinder<DomainObjectIntersection>(
      intersectInput.raycaster.ray.origin
    );

    if (closestDistance !== undefined) {
      closestFinder.minDistance = closestDistance;
    }

    const intersectedOverlay = this._overlayCollection.intersectOverlays(
      intersectInput.normalizedCoords,
      intersectInput.camera
    );

    if (intersectedOverlay === undefined || !intersectedOverlay.getVisible()) {
      return undefined;
    }

    const point = intersectedOverlay.getPosition();

    if (!closestFinder.isClosest(point)) {
      return undefined;
    }

    const customObjectIntersection = createPointsOfInterestIntersection(
      point,
      closestFinder.minDistance,
      this,
      domainObject,
      intersectedOverlay.getContent()
    );

    closestFinder.setClosestGeometry(customObjectIntersection);
    return closestFinder.getClosestGeometry();
  }

  public getOverlays(): PointsOfInterestCollection<PoiIdType> {
    return this._overlayCollection;
  }

  private updateClipping(): void {
    const clippingPlanes = this.renderTarget.getGlobalClippingPlanes();
    this._overlayCollection.getOverlays().forEach((overlay) => {
      const isVisible = isPointVisibleByPlanes(clippingPlanes, overlay.getPosition());
      if (isVisible !== overlay.getVisible()) {
        overlay.setVisible(isVisible);
      }
    });
  }

  private updateColors(): void {
    const selectedPointsOfInterest = this.domainObject.selectedPointsOfInterest;
    this._overlayCollection.getOverlays().forEach((overlay) => {
      const oldColor = overlay.getColor();
      const newColor = getColorFromStatus(
        overlay.getContent().status,
        overlay.getContent() === selectedPointsOfInterest
      );

      if (oldColor.equals(newColor)) {
        return;
      }

      overlay.setColor(newColor);
    });
  }
}

function createPointsOfInterestOverlays<PoiIdType>(
  pois: Array<PointOfInterest<PoiIdType>>,
  selectedPointsOfInterest: PointOfInterest<PoiIdType> | undefined
): Array<OverlayInfo<PointOfInterest<PoiIdType>>> {
  return pois.map((poi) => ({
    position: extractPointsOfInterestPosition(poi),
    content: poi,
    color: getColorFromStatus(poi.status, poi === selectedPointsOfInterest)
  }));
}

function extractPointsOfInterestPosition<PoiIdType>(poi: PointOfInterest<PoiIdType>): Vector3 {
  return new Vector3(
    poi.properties.positionX,
    poi.properties.positionY,
    poi.properties.positionZ
  ).applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
}
