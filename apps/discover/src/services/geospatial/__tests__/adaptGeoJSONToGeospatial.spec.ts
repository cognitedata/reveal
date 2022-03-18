import {
  GEOMETRY_POINT_1,
  GEOMETRY_POINT_2,
  LONGEST_STRING,
  TEST_DOUBLE_NUMBER,
  TEST_LAYER_ID,
} from '__test-utils/fixtures/geometry';

import { adaptGeoJSONToGeospatial } from '../adaptGeoJSONToGeospatial';
import {
  DISCOVER_FEATURE_PREFIX,
  DISCOVER_FEATURE_TYPE_PREFIX,
  MAX_STRING_LENGTH_MULTIPLIER,
} from '../constants';

describe('adaptGeoJSONToGeospatial', () => {
  it('should return featureType and featureItems', () => {
    const { featureType, featureItems } = adaptGeoJSONToGeospatial(
      {
        type: 'FeatureCollection',
        features: [],
      },
      TEST_LAYER_ID
    );
    expect(featureType).toBeDefined();
    expect(featureItems).toBeDefined();
  });
  it('should return featureType & featureItem with prefix name in externalId', () => {
    const { featureType, featureItems } = adaptGeoJSONToGeospatial(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            ...GEOMETRY_POINT_1,
            properties: {},
          },
        ],
      },
      TEST_LAYER_ID
    );
    expect(featureType.externalId).toBe(
      `${DISCOVER_FEATURE_TYPE_PREFIX}${TEST_LAYER_ID}`
    );
    expect(featureItems[0].externalId).toBe(
      `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_0`
    );
  });
  it('should return featureItems with STRING type attribute Operator', () => {
    const { featureType, featureItems } = adaptGeoJSONToGeospatial(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            ...GEOMETRY_POINT_1,
            properties: {
              Operator: 'Test Operator',
            },
          },
          {
            type: 'Feature',
            ...GEOMETRY_POINT_2,
            properties: {
              Operator: null,
            },
          },
          {
            type: 'Feature',
            ...GEOMETRY_POINT_2,
            properties: {
              Operator: LONGEST_STRING,
            },
          },
        ],
      },
      TEST_LAYER_ID
    );
    expect(featureType.properties).toEqual(
      expect.objectContaining({
        Operator: {
          type: 'STRING',
          size: LONGEST_STRING.length * MAX_STRING_LENGTH_MULTIPLIER,
          optional: true,
        },
      })
    );
    expect(featureItems).toEqual(
      expect.arrayContaining([
        {
          externalId: `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_0`,
          ...GEOMETRY_POINT_1,
          Operator: 'Test Operator',
        },
        {
          externalId: `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_1`,
          ...GEOMETRY_POINT_2,
          Operator: null,
        },
        {
          externalId: `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_2`,
          ...GEOMETRY_POINT_2,
          Operator: LONGEST_STRING,
        },
      ])
    );
  });
  it('should return featureItems with DOUBLE type attribute weight', () => {
    const { featureType, featureItems } = adaptGeoJSONToGeospatial(
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
          {
            type: 'Feature',
            ...GEOMETRY_POINT_2,
            properties: {
              weight: null,
            },
          },
          {
            type: 'Feature',
            ...GEOMETRY_POINT_2,
            properties: {
              weight: 500,
              Operator: LONGEST_STRING,
            },
          },
        ],
      },
      TEST_LAYER_ID
    );
    expect(featureType.properties).toEqual(
      expect.objectContaining({
        weight: {
          type: 'DOUBLE',
          optional: true,
        },
        Operator: {
          type: 'STRING',
          size: LONGEST_STRING.length * MAX_STRING_LENGTH_MULTIPLIER,
          optional: true,
        },
      })
    );
    expect(featureItems).toEqual(
      expect.arrayContaining([
        {
          externalId: `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_0`,
          ...GEOMETRY_POINT_1,
          weight: 20,
        },
        {
          externalId: `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_1`,
          ...GEOMETRY_POINT_2,
          weight: null,
        },
        {
          externalId: `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_2`,
          ...GEOMETRY_POINT_2,
          weight: 500,
          Operator: LONGEST_STRING,
        },
      ])
    );
  });
  it('should return featureItems with BOOLEAN type attribute isTest', () => {
    const { featureType, featureItems } = adaptGeoJSONToGeospatial(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            ...GEOMETRY_POINT_1,
            properties: {
              weight: 20,
              Operator: 'Test Operator another',
              isTest: true,
            },
          },
          {
            type: 'Feature',
            ...GEOMETRY_POINT_2,
            properties: {
              weight: null,
            },
          },
          {
            type: 'Feature',
            ...GEOMETRY_POINT_2,
            properties: {
              weight: TEST_DOUBLE_NUMBER,
              Operator: LONGEST_STRING,
            },
          },
        ],
      },
      TEST_LAYER_ID
    );
    expect(featureType.properties).toEqual(
      expect.objectContaining({
        weight: {
          type: 'DOUBLE',
          optional: true,
        },
        Operator: {
          type: 'STRING',
          size: LONGEST_STRING.length * MAX_STRING_LENGTH_MULTIPLIER,
          optional: true,
        },
        isTest: {
          type: 'BOOLEAN',
          optional: true,
        },
      })
    );
    expect(featureItems).toEqual(
      expect.arrayContaining([
        {
          externalId: `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_0`,
          ...GEOMETRY_POINT_1,
          weight: 20,
          Operator: 'Test Operator another',
          isTest: true,
        },
        {
          externalId: `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_1`,
          ...GEOMETRY_POINT_2,
          weight: null,
        },
        {
          externalId: `${DISCOVER_FEATURE_PREFIX}${TEST_LAYER_ID}_2`,
          ...GEOMETRY_POINT_2,
          weight: TEST_DOUBLE_NUMBER,
          Operator: LONGEST_STRING,
        },
      ])
    );
  });
});
