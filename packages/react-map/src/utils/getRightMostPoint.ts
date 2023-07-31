import {
  point as TurfPoint,
  FeatureCollection,
  Point,
  Properties,
  featureCollection,
} from '@turf/helpers';
import nearestPoint from '@turf/nearest-point';

import { isPolygon } from './isPolygon';

export const getRightMostPoint = (
  innerMap: any,
  featureToSelect: any
): any | null => {
  if (!innerMap) {
    return null;
  }

  const bounds = innerMap.getBounds();

  if (!bounds) {
    return null;
  }
  // eslint-disable-next-line no-underscore-dangle
  const targetPoint = TurfPoint([bounds._ne.lat, bounds._ne.lng]);

  const coordinates = isPolygon(featureToSelect)
    ? featureToSelect.geometry.coordinates[0]
    : featureToSelect.geometry.coordinates;

  const collection: FeatureCollection<Point, Properties> = featureCollection(
    coordinates.map((coordinate: [number, number]) =>
      TurfPoint([coordinate[0], coordinate[1]])
    )
  );

  return nearestPoint(targetPoint, collection);
};
