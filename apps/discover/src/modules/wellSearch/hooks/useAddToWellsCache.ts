import { Well } from 'domain/wells/well/internal/types';

import { useQueryClient } from 'react-query';

import concat from 'lodash/concat';
import differenceBy from 'lodash/differenceBy';

import { WELL_QUERY_KEY } from 'constants/react-query';

export const useAddToWellsCache = () => {
  const queryClient = useQueryClient();

  const cachedWells =
    queryClient.getQueryData<Well[]>(WELL_QUERY_KEY.WELLS_CACHE) || [];

  return (wells: Well[]) => {
    const newWellsToCache = differenceBy(wells, cachedWells, 'id');

    queryClient.setQueryData(
      WELL_QUERY_KEY.WELLS_CACHE,
      concat(cachedWells, newWellsToCache)
    );
  };
};
