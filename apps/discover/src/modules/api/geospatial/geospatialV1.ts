import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';

import {
  adaptGeoJSONToGeospatial,
  CustomGeoJSON,
} from './adaptGeoJSONToGeospatial';
import { adaptGeospatialToGeoJSON } from './adaptGeospatialToGeoJSON';
import { DISCOVER_FEATURE_TYPE_PREFIX } from './constants';

export const geospatialV1 = {
  createLayer: (featureCollection: CustomGeoJSON) => {
    const { featureType, featureItems } =
      adaptGeoJSONToGeospatial(featureCollection);

    return getCogniteSDKClient()
      .spatial.featureTypes.create([featureType])
      .then(([featureTypeResponse]) =>
        getCogniteSDKClient().spatial.features.create(
          featureTypeResponse.externalId,
          featureItems
        )
      );
  },
  getGeoJSON: (name: string) => {
    return getCogniteSDKClient()
      .spatial.features.search(
        `${DISCOVER_FEATURE_TYPE_PREFIX}${name}`,
        // eslint-disable-next-line
        // @ts-ignore fixed type in v7 of sdk
        { output: { geometryFormat: 'GEOJSON' } }
      )
      .then((features) => adaptGeospatialToGeoJSON(features));
  },
};
