import { Feature, FeatureCollection } from 'geojson';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';

import { GeospatialCreateFeatureType, GeospatialFeature } from '@cognite/sdk';

import {
  MAX_STRING_LENGTH_MULTIPLIER,
  DISCOVER_FEATURE_PREFIX,
} from '../../constants';

export const adaptGeoJSONToGeospatial = (
  featureCollection: FeatureCollection,
  id: string
) => {
  const { features } = featureCollection;
  return reduce<
    Feature,
    {
      featureType: GeospatialCreateFeatureType;
      featureItems: GeospatialFeature[];
    }
  >(
    features,
    (acc, feature, index) => {
      const { properties, geometry } = feature;

      acc.featureItems.push({
        externalId: `${DISCOVER_FEATURE_PREFIX}${id}_${index}`,
        geometry,
        ...properties,
      });

      const existingProperties = acc.featureType.properties;
      const newProperties = {
        ...existingProperties,
      };

      forEach(properties, (value, key) => {
        const existingFeatureTypeProperty = existingProperties[key];
        if (value) {
          const valueType = typeof value;
          switch (valueType) {
            case 'string':
              newProperties[key] = {
                type: 'STRING',
                size:
                  existingFeatureTypeProperty?.type === 'STRING' &&
                  existingFeatureTypeProperty?.size &&
                  existingFeatureTypeProperty.size >
                    value.length * MAX_STRING_LENGTH_MULTIPLIER
                    ? existingFeatureTypeProperty.size
                    : value.length * MAX_STRING_LENGTH_MULTIPLIER,
                optional: true,
              };
              break;
            case 'number':
              newProperties[key] = {
                type: 'DOUBLE',
                optional: true,
              };
              break;
            case 'boolean':
              newProperties[key] = {
                type: 'BOOLEAN',
                optional: true,
              };
              break;
            default:
          }
        }
      });
      return {
        ...acc,
        featureType: { ...acc.featureType, properties: newProperties },
      };
    },
    {
      featureType: {
        externalId: id,
        properties: {
          geometry: { type: 'GEOMETRY', srid: 4326 },
        },
      },
      featureItems: [],
    }
  );
};
