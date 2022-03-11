import { FeatureCollection } from 'geojson';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';
import { log } from 'utils/log';

import { adaptGeoJSONToGeospatial } from './adaptGeoJSONToGeospatial';
import { adaptGeospatialToGeoJSON } from './adaptGeospatialToGeoJSON';
import { DISCOVER_FEATURE_TYPE_PREFIX } from './constants';

export const geospatialV1 = {
  createLayer: (featureCollection: FeatureCollection, layerId: string) => {
    const { featureType, featureItems } = adaptGeoJSONToGeospatial(
      featureCollection,
      layerId
    );

    return getCogniteSDKClient()
      .geospatial.featureType.create([featureType])
      .catch((error) => {
        log(error?.message);
        throw new Error(
          'Could not create layer because creating feature type in geospatial failed.'
        );
      })
      .then(([featureTypeResponse]) =>
        getCogniteSDKClient()
          .geospatial.feature.create(
            featureTypeResponse.externalId,
            featureItems
          )
          .catch((error) => {
            geospatialV1.deleteFeatureType(layerId);
            log(error?.message);
            throw new Error(
              'Could not create layer because creating features in geospatial failed.'
            );
          })
      );
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
