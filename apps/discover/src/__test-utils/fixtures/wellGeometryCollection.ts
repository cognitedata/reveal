import { getMockPointGeo } from '__test-utils/fixtures/geometry';

export const getMockWellGeometry = () => {
  return {
    geometry: getMockPointGeo(),
    properties: { id: 'well-collection-1' },
  };
};

export const getMockWellGeometryCollection = () => {
  return {
    features: [getMockWellGeometry()],
    type: 'GeometryCollection',
  };
};
