import { Geometry, Point } from '@cognite/seismic-sdk-js';

export const getMockGeometry = (): Exclude<Geometry, 'GeometryCollection'> => {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [1, 1],
        [2, 2],
        [3, 3],
      ],
    ],
  };
};

export const getMockPointGeo = (): Point => {
  return {
    type: 'Point',
    coordinates: [12, 14],
  };
};
