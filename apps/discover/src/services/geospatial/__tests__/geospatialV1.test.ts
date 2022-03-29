import '__mocks/mockContainerAuth';
import '__mocks/mockCogniteSDK';
import {
  GEOMETRY,
  TEST_STRING,
  GEOMETRY_POINT_1,
  TEST_LAYER_ID,
} from '__test-utils/fixtures/geometry';

import {
  DISCOVER_FEATURE_TYPE_PREFIX,
  FEATURE_ERROR,
  FEATURE_TYPE_ERROR,
  TEST_ERROR_MESSAGE,
} from '../constants';
import { geospatialV1 } from '../geospatialV1';

describe('GeospecialV1 Actions', () => {
  const origConsole = global.console;
  beforeAll(() => {
    // @ts-expect-error - missing other keys
    global.console = { error: jest.fn() }; // used for test console errors
  });
  afterAll(() => {
    global.console = origConsole;
  });
  it('should return expected output', async () => {
    const result = await geospatialV1.createLayer(
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
    expect(result).toBe(`${DISCOVER_FEATURE_TYPE_PREFIX}${TEST_LAYER_ID}`);
    expect(console.error).toHaveBeenCalledTimes(0);
  });
  it('should return error messages as expected in feature types', async () => {
    const result = geospatialV1.createLayer(
      {
        type: 'FeatureCollection',
        features: [],
      },
      ''
    );

    await expect(result).rejects.toThrowError(FEATURE_TYPE_ERROR);
    expect(console.error).toHaveBeenCalledWith(TEST_ERROR_MESSAGE);
  });

  it('should return error messages as expected in features', async () => {
    const result = geospatialV1.createLayer(
      {
        type: 'FeatureCollection',
        features: [],
      },
      TEST_LAYER_ID
    );
    await expect(result).rejects.toThrowError(FEATURE_ERROR);
    expect(console.error).toHaveBeenCalledWith(TEST_ERROR_MESSAGE);
  });

  it('should return expected output with getGeoJSON', async () => {
    const result = await geospatialV1.getGeoJSON(TEST_LAYER_ID);

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
