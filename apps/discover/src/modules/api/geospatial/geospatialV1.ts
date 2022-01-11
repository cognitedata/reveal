import { FeatureCollection } from 'geojson';
import { getCogniteSDKClientV7 } from 'utils/getCogniteSDKClient';
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

    return getCogniteSDKClientV7()
      .geospatial.featureType.create([featureType])
      .catch((error) => {
        log(error?.message);
        throw new Error(
          'Could not create layer because creating feature type in geospatial failed.'
        );
      })
      .then(([featureTypeResponse]) =>
        getCogniteSDKClientV7()
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
    return getCogniteSDKClientV7()
      .geospatial.feature.search(`${DISCOVER_FEATURE_TYPE_PREFIX}${id}`, {
        output: { geometryFormat: 'GEOJSON' },
      })
      .then((features) => adaptGeospatialToGeoJSON(features));
  },
  deleteFeatureType: (id: string, params = { recursive: true }) => {
    return getCogniteSDKClientV7().geospatial.featureType.delete(
      [{ externalId: `${DISCOVER_FEATURE_TYPE_PREFIX}${id}` }],
      params
    );
  },
};
