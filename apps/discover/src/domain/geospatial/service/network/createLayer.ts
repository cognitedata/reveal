import { FeatureCollection } from 'geojson';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';
import { log } from 'utils/log';

import { FEATURE_ERROR, FEATURE_TYPE_ERROR } from '../../constants';
import { adaptGeoJSONToGeospatial } from '../../internal/adapters/adaptGeoJSONToGeospatial';

import { deleteFeatureType } from './deleteFeatureType';

export const createLayer = (
  featureCollection: FeatureCollection,
  featureTypeId: string
) => {
  const { featureType, featureItems } = adaptGeoJSONToGeospatial(
    featureCollection,
    featureTypeId
  );

  return getCogniteSDKClient()
    .geospatial.featureType.create([featureType])
    .catch((error) => {
      log(error?.message);
      throw new Error(FEATURE_TYPE_ERROR);
    })
    .then(([featureTypeResponse]) => {
      return getCogniteSDKClient()
        .geospatial.feature.create(featureTypeResponse.externalId, featureItems)
        .catch((error) => {
          deleteFeatureType(featureTypeId);
          log(error?.message);
          throw new Error(FEATURE_ERROR);
        });
    });
};
