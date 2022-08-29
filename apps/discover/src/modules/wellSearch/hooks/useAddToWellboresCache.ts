import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { useQueryClient } from 'react-query';

import concat from 'lodash/concat';
import differenceBy from 'lodash/differenceBy';

import { WELL_QUERY_KEY } from 'constants/react-query';

export const useAddToWellboresCache = () => {
  const queryClient = useQueryClient();

  const cachedWellbores =
    queryClient.getQueryData<WellboreInternal[]>(
      WELL_QUERY_KEY.WELLBORES_CACHE
    ) || [];

  return (wellbores: WellboreInternal[]) => {
    const newWellboresToCache = differenceBy(wellbores, cachedWellbores, 'id');

    queryClient.setQueryData(
      WELL_QUERY_KEY.WELLBORES_CACHE,
      concat(cachedWellbores, newWellboresToCache)
    );
  };
};
