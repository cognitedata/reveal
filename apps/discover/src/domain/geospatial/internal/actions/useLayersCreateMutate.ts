import { useMutation, useQueryClient } from 'react-query';

import omit from 'lodash/omit';
import { handleServiceError } from 'utils/errors';

import { GEOSPATIAL_QUERY_KEY } from 'constants/react-query';

import { createLayer } from '../../service/network';
import { LayerFormValues, OnSuccess } from '../types';

export const useLayersCreateMutate = (onSuccess: OnSuccess) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: LayerFormValues) =>
      createLayer(data.layerSource, data.featureTypeId).then(() =>
        onSuccess(omit(data, 'layerSource'))
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(GEOSPATIAL_QUERY_KEY.FEATURE_TYPES);
      },
      onError: (error: Error) =>
        handleServiceError(
          error,
          undefined,
          'Could not create layer. Please check JSON file.'
        ),
    }
  );
};
