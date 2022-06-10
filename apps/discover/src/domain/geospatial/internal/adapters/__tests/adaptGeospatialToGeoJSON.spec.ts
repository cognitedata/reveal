import { GEOMETRY, TEST_STRING } from '__test-utils/fixtures/geometry';

import { adaptGeospatialToGeoJSON } from '../adaptGeospatialToGeoJSON';

describe('adaptGeospatialToGeoJSON', () => {
  it('should return GeoJSON with empty features when no geospatial feature is sent', () => {
    const geoJSON = adaptGeospatialToGeoJSON([]);
    expect(geoJSON.features).toEqual([]);
    expect(geoJSON.type).toEqual('FeatureCollection');
  });
  it('should return GeoJSON with features when no geospatial feature items are sent', () => {
    const geoJSON = adaptGeospatialToGeoJSON([
      {
        geometry: GEOMETRY,
        Operator: TEST_STRING,
        createdTime: Date.now(),
        lastUpdatedTime: Date.now(),
        externalId: 'test',
      },
    ]);
    expect(geoJSON.features).toEqual([
      {
        type: 'Feature',
        geometry: GEOMETRY,
        properties: {
          Operator: TEST_STRING,
        },
      },
    ]);
  });
});
