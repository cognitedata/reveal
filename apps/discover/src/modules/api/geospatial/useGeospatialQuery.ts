import { useMutation } from 'react-query';

import noop from 'lodash/noop';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import {
  FeatureTypesCreateItem,
  FeaturesCreateItem,
  CogniteExternalId,
} from '@cognite/sdk';

import { geospatialV1 } from './geospatialV1';

export const useFeatureCreateQuery = () => {
  return useMutation(
    ({
      featureTypeExternalId,
      features,
    }: {
      featureTypeExternalId: CogniteExternalId;
      features: FeaturesCreateItem[];
    }) => {
      return getCogniteSDKClient().spatial.features.create(
        featureTypeExternalId,
        features
      );
    }
  );
};

export const useFeatureTypeCreateQuery = () => {
  return useMutation((featureTypes: FeatureTypesCreateItem[]) => {
    return getCogniteSDKClient().spatial.featureTypes.create(featureTypes);
  });
};

export const useLayerCreateQuery = ({
  onSuccess = noop,
  onError = noop,
}: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation(geospatialV1.createLayer, { onSuccess, onError });
};
