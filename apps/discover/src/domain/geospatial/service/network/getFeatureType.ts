import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

export const getFeatureType = (featureTypeId: string) => {
  return getCogniteSDKClient().geospatial.featureType.retrieve([
    { externalId: featureTypeId },
  ]);
};
