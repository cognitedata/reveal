import { useMutation } from 'react-query';

import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import {
  GeospatialCreateFeatureType,
  GeospatialFeature,
  CogniteExternalId,
} from '@cognite/sdk';

export const useFeatureCreateQuery = () => {
  return useMutation(
    ({
      featureTypeExternalId,
      features,
    }: {
      featureTypeExternalId: CogniteExternalId;
      features: GeospatialFeature[];
    }) => {
      return getCogniteSDKClient().geospatial.feature.create(
        featureTypeExternalId,
        features
      );
    }
  );
};

export const useFeatureTypeCreateQuery = () => {
  return useMutation((featureTypes: GeospatialCreateFeatureType[]) => {
    return getCogniteSDKClient().geospatial.featureType.create(featureTypes);
  });
};
