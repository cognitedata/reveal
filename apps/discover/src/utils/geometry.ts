import { Geometry } from '@cognite/seismic-sdk-js';

export const getEmptyGeometry = (): Geometry => {
  return {
    type: 'Polygon',
    coordinates: [],
  };
};
