import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

export const deleteFeatureType = (
  featureTypeId: string,
  params = { recursive: true }
) => {
  return getCogniteSDKClient().geospatial.featureType.delete(
    [{ externalId: featureTypeId }],
    params
  );
};
