import { FeatureCollection } from 'geojson';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';
import { log } from 'utils/log';

import { adaptGeoJSONToGeospatial } from './adaptGeoJSONToGeospatial';
import { adaptGeospatialToGeoJSON } from './adaptGeospatialToGeoJSON';
import {
  DISCOVER_FEATURE_TYPE_PREFIX,
  FEATURE_ERROR,
  FEATURE_TYPE_ERROR,
} from './constants';

export const geospatial = {
  createLayer: (featureCollection: FeatureCollection, layerId: string) => {
    const { featureType, featureItems } = adaptGeoJSONToGeospatial(
      featureCollection,
      layerId
    );

    return getCogniteSDKClient()
      .geospatial.featureType.create([featureType])
      .catch((error) => {
        log(error?.message);
        throw new Error(FEATURE_TYPE_ERROR);
      })
      .then(([featureTypeResponse]) => {
        return getCogniteSDKClient()
          .geospatial.feature.create(
            featureTypeResponse.externalId,
            featureItems
          )
          .catch((error) => {
            geospatial.deleteFeatureType(layerId);
            log(error?.message);
            throw new Error(FEATURE_ERROR);
          });
      });
  },
  getGeoJSON: (id: string) => {
    return getCogniteSDKClient()
      .geospatial.feature.search(`${DISCOVER_FEATURE_TYPE_PREFIX}${id}`, {
        output: { geometryFormat: 'GEOJSON' },
      })
      .then((features) => adaptGeospatialToGeoJSON(features));
  },
  deleteFeatureType: (id: string, params = { recursive: true }) => {
    return getCogniteSDKClient().geospatial.featureType.delete(
      [{ externalId: `${DISCOVER_FEATURE_TYPE_PREFIX}${id}` }],
      params
    );
  },
};
