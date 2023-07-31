import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

export const getFeatureTypesList = () => {
  return getCogniteSDKClient().geospatial.featureType.list();
};
