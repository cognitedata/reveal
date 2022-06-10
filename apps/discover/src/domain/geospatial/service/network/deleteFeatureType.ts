import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { DISCOVER_FEATURE_TYPE_PREFIX } from '../../constants';

export const deleteFeatureType = (
  featureTypeId: string,
  params = { recursive: true }
) => {
  return getCogniteSDKClient().geospatial.featureType.delete(
    [{ externalId: `${DISCOVER_FEATURE_TYPE_PREFIX}${featureTypeId}` }],
    params
  );
};
