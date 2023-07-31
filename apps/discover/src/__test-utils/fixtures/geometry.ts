import { GeoJson, Geometry, Point } from '@cognite/seismic-sdk-js';

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

export const getMockGeoJson = (extra = {}): GeoJson => {
  return {
    id: '8e7f06f0a751dc0d6699080b4d11ce54',
    type: 'Feature',
    properties: {},
    geometry: {
      coordinates: [
        [
          [-3.4028320312505684, 59.071916049583194],
          [13.340332031250028, 60.44395167378224],
          [13.164550781249346, 47.73600994447236],
          [-1.6889648437499147, 47.35037273730319],
          [-3.4028320312505684, 59.071916049583194],
        ],
      ],
      type: 'Polygon',
    },
    ...extra,
  };
};

export const getMockPointGeo = (): Point => {
  return {
    type: 'Point',
    coordinates: [12, 14],
  };
};

export const TEST_LAYER_ID = 'test_layer';
export const LONGEST_STRING =
  'BP EXPLORATION OPERATING COMPANY LIMITED: BP EXPLORATION OPERATING COMPANY LIMITED';
export const TEST_DOUBLE_NUMBER = 5000.23423;
export const GEOMETRY_POINT_1: { geometry: Geometry } = {
  geometry: { type: 'Point', coordinates: [0, 1] },
};
export const GEOMETRY_POINT_2: { geometry: Geometry } = {
  geometry: { type: 'Point', coordinates: [1, 2] },
};

export const GEOMETRY = { type: 'Point' as const, coordinates: [0, 0] };
export const TEST_STRING = 'Aker test';
