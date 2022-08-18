import { Feature } from '@turf/helpers';

export const isPolygon = (feature?: Feature) => {
  return feature?.geometry?.type === 'Polygon';
};
