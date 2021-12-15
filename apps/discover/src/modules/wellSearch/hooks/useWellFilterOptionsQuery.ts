import { useQuery, useQueryClient } from 'react-query';

import { ONLY_FETCH_ONCE, WELL_QUERY_KEY } from 'constants/react-query';
import { UserPrefferedUnit } from 'constants/units';

import { getFilterOptions } from '../service';

export const useWellFilterOptions = (unit: UserPrefferedUnit) => {
  return useQuery(WELL_QUERY_KEY.FILTER_OPTIONS, () => getFilterOptions(unit), {
    ...ONLY_FETCH_ONCE,
  });
};

export const usePrefetchWellFilterOptions = (unit?: UserPrefferedUnit) => {
  const queryClient = useQueryClient();

  if (!unit) {
    return;
  }

  queryClient.prefetchQuery(WELL_QUERY_KEY.FILTER_OPTIONS, () =>
    getFilterOptions(unit)
  );
};
