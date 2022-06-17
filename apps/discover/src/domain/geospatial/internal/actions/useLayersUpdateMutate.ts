import { useMutation, useQueryClient } from 'react-query';

import omit from 'lodash/omit';
import { handleServiceError } from 'utils/errors';

import { GEOSPATIAL_QUERY_KEY } from 'constants/react-query';

import { createLayer } from '../../service/network';
import { OnSuccess, LayerFormValues } from '../types';

export const useLayersUpdateMutate = (onSuccess: OnSuccess) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: LayerFormValues) => {
      return createLayer(data.layerSource, data.featureTypeId).then(() =>
        onSuccess({
          ...omit(data, 'layerSource'),
          featureTypeId: data.featureTypeId,
        })
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(GEOSPATIAL_QUERY_KEY.FEATURE_TYPES);
      },
      onError: (error: Error) =>
        handleServiceError(error, undefined, 'Could not update layer.'),
    }
  );
};
