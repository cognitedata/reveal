import { Feature, FeatureCollection, Geometry } from 'geojson';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';

import {
  Attributes,
  CogniteExternalId,
  FeaturesCreateItem,
} from '@cognite/sdk';

import {
  MAX_STRING_LENGTH_MULTIPLIER,
  DISCOVER_FEATURE_PREFIX,
  DISCOVER_FEATURE_TYPE_PREFIX,
} from './constants';

export type CustomGeoJSON = FeatureCollection<
  Geometry,
  Record<string, unknown>
> & {
  name: string;
};

export const adaptGeoJSONToGeospatial = (featureCollection: CustomGeoJSON) => {
  const { features, name } = featureCollection;
  return reduce<
    Feature,
    {
      featureType: { externalId: CogniteExternalId; attributes: Attributes };
      featureItems: FeaturesCreateItem[];
    }
  >(
    features,
    (acc, feature, index) => {
      const { properties, geometry } = feature;

      acc.featureItems.push({
        externalId: `${DISCOVER_FEATURE_PREFIX}${name}_${index}`,
        // eslint-disable-next-line
        // @ts-ignore type to be fixed in new version of sdk
        geometry,
        ...properties,
      });

      const existingAttributes = acc.featureType.attributes;
      const newAttributes = {
        ...existingAttributes,
      };

      forEach(properties, (value, key) => {
        const existingFeatureTypeProperty = existingAttributes[key];
        if (value) {
          const valueType = typeof value;
          switch (valueType) {
            case 'string':
              newAttributes[key] = {
                type: 'STRING',
                size:
                  existingFeatureTypeProperty?.size &&
                  existingFeatureTypeProperty.size >
                    value.length * MAX_STRING_LENGTH_MULTIPLIER
                    ? existingFeatureTypeProperty.size
                    : value.length * MAX_STRING_LENGTH_MULTIPLIER,
              };
              break;
            case 'number':
              newAttributes[key] = {
                type: 'DOUBLE',
              };
              break;
            case 'boolean':
              newAttributes[key] = {
                type: 'BOOLEAN',
              };
              break;
            default:
          }
        }
      });
      return {
        ...acc,
        featureType: { ...acc.featureType, attributes: newAttributes },
      };
    },
    {
      featureType: {
        externalId: `${DISCOVER_FEATURE_TYPE_PREFIX}${name}`,
        attributes: {
          geometry: { type: 'GEOMETRY', srid: 4326 },
        },
      },
      featureItems: [],
    }
  );
};
