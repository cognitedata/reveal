import { useMutation } from 'react-query';

import { getCogniteSDKClientV7 } from 'utils/getCogniteSDKClient';

import {
  GeospatialCreateFeatureType,
  GeospatialFeature,
  CogniteExternalId,
} from '@cognite/sdk-v7';

export const useFeatureCreateQuery = () => {
  return useMutation(
    ({
      featureTypeExternalId,
      features,
    }: {
      featureTypeExternalId: CogniteExternalId;
      features: GeospatialFeature[];
    }) => {
      return getCogniteSDKClientV7().geospatial.feature.create(
        featureTypeExternalId,
        features
      );
    }
  );
};

export const useFeatureTypeCreateQuery = () => {
  return useMutation((featureTypes: GeospatialCreateFeatureType[]) => {
    return getCogniteSDKClientV7().geospatial.featureType.create(featureTypes);
  });
};
