import { Geometry, FeatureCollection } from 'geojson';
import map from 'lodash/map';
import omit from 'lodash/omit';

import { GeospatialFeatureResponse } from '@cognite/sdk-v7';

export const adaptGeospatialToGeoJSON = (
  features: GeospatialFeatureResponse[]
): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: map(features, (feature) => {
      return {
        type: 'Feature',
        geometry: feature.geometry as Geometry,
        properties: omit(feature, [
          'geometry',
          'externalId',
          'createdTime',
          'lastUpdatedTime',
        ]),
      };
    }),
  };
};
