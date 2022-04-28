import '__mocks/mockCogniteSDK';
import { setupServer } from 'msw/node';

import {
  GEOMETRY,
  TEST_STRING,
  GEOMETRY_POINT_1,
  TEST_LAYER_ID,
} from '__test-utils/fixtures/geometry';

import { getMockGeospatialFeature } from '../__mocks/getMockGeospatialFeature';
import { getMockGeospatialFeatureSearch } from '../__mocks/getMockGeospatialFeatureSearch';
import { getMockGeospatialFeatureTypes } from '../__mocks/getMockGeospatialFeatureTypes';
import { getMockGeospatialFeatureTypesDelete } from '../__mocks/getMockGeospatialFeatureTypesDelete';
import { FEATURE_ERROR, FEATURE_TYPE_ERROR } from '../constants';
import { geospatial } from '../geospatial';

const mockServer = setupServer(
  getMockGeospatialFeatureTypes(),
  getMockGeospatialFeature(),
  getMockGeospatialFeatureTypesDelete(),
  getMockGeospatialFeatureSearch()
);
describe('GeospecialV1 Actions', () => {
  const origConsole = global.console;
  beforeAll(() => {
    mockServer.listen();
    // @ts-expect-error - missing other keys
    global.console = {
      error: jest.fn(),
      log: origConsole.log,
      warn: origConsole.warn,
    }; // used for test console errors
  });
  afterAll(() => {
    mockServer.close();
    global.console = origConsole;
  });

  it('should return expected output', async () => {
    const result = await geospatial.createLayer(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            ...GEOMETRY_POINT_1,
            properties: {
              weight: 20,
            },
          },
        ],
      },
      TEST_LAYER_ID
    );
    expect(result).toEqual([
      {
        externalId: 'DF_test_layer_0',
        geometry: { coordinates: [0, 1], type: 'Point' },
        weight: 20,
      },
    ]);
    // expect(result).toBe(`${DISCOVER_FEATURE_TYPE_PREFIX}${TEST_LAYER_ID}`);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should return error messages as expected in feature types', async () => {
    const result = geospatial.createLayer(
      {
        type: 'FeatureCollection',
        features: [],
      },
      ''
    );

    await expect(result).rejects.toThrowError(FEATURE_TYPE_ERROR);
    expect(console.error).toHaveBeenCalled();
  });

  it('should return error messages as expected in features', async () => {
    const result = geospatial.createLayer(
      {
        type: 'FeatureCollection',
        features: [],
      },
      TEST_LAYER_ID
    );
    await expect(result).rejects.toThrowError(FEATURE_ERROR);
    expect(console.error).toHaveBeenCalled();
  });

  it('should return expected output with getGeoJSON', async () => {
    const result = await geospatial.getGeoJSON(TEST_LAYER_ID);

    expect(result.features).toEqual([
      {
        type: 'Feature',
        geometry: GEOMETRY,
        properties: {
          Operator: TEST_STRING,
        },
      },
    ]);
    expect(console.error).toHaveBeenCalledTimes(0);
  });
});
