import { FeatureCollection, Feature } from 'geojson';
import dropRight from 'lodash/dropRight';
import get from 'lodash/get';
import head from 'lodash/head';
import map from 'lodash/map';
import omit from 'lodash/omit';

import { Features } from '@cognite/sdk';

import { DISCOVER_FEATURE_PREFIX } from './constants';

export const adaptGeospatialToGeoJSON = (features: Features[]) => {
  const externalId = get(head(features), 'externalId', '');
  const externalIdWithoutPrefix = externalId.replace(
    DISCOVER_FEATURE_PREFIX,
    ''
  );
  const name = dropRight(externalIdWithoutPrefix.split('_'), 1).join('_');
  return {
    type: 'FeatureCollection' as FeatureCollection['type'],
    name,
    features: map(features, (feature) => {
      return {
        type: 'Feature' as Feature['type'],
        geometry: feature.geometry,
        properties: omit(feature, [
          'geometry',
          'externalId',
          'createdTime',
          'updatedTime',
        ]),
      };
    }),
  };
};
