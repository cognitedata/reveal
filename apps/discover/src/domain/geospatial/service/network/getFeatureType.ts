import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { DISCOVER_FEATURE_TYPE_PREFIX } from '../../constants';

export const getFeatureType = (featureTypeId: string) => {
  return getCogniteSDKClient().geospatial.featureType.retrieve([
    { externalId: `${DISCOVER_FEATURE_TYPE_PREFIX}${featureTypeId}` },
  ]);
};
