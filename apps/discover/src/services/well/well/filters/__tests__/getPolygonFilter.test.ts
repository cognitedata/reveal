import { getMockWellGeometry } from '__test-utils/fixtures/wellGeometryCollection';

import { getPolygonFilter } from '../getPolygonFilter';

describe('getPolygonFilter', () => {
  describe('good cases', () => {
    test('basic', () => {
      expect(getPolygonFilter([getMockWellGeometry()])).toMatchObject({
        crs: 'EPSG:4326',
        geometryType: 'GeoJSON',
        geometry: '{"type":"Point","coordinates":[12,14]}',
      });
    });
  });
  describe('bad cases', () => {
    test('empty', () => {
      expect(getPolygonFilter([])).toEqual(undefined);
    });
    test('undefined', () => {
      // @ts-expect-error testing undefined
      expect(getPolygonFilter()).toEqual(undefined);
    });
  });
});
