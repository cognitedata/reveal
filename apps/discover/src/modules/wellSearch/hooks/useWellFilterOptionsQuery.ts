import { useQuery, useQueryClient } from 'react-query';

import { ONLY_FETCH_ONCE, WELL_QUERY_KEY } from 'constants/react-query';

import { useUserPreferencesMeasurement } from '../../../hooks/useUserPreferences';
import { getFilterOptions } from '../service';

export const useWellFilterOptions = () => {
  const usePreferredUnit = useUserPreferencesMeasurement();
  return useQuery(
    [...WELL_QUERY_KEY.FILTER_OPTIONS, usePreferredUnit],
    () => getFilterOptions(usePreferredUnit),
    {
      ...ONLY_FETCH_ONCE,
    }
  );
};

export const usePrefetchWellFilterOptions = () => {
  const usePreferredUnit = useUserPreferencesMeasurement();
  const queryClient = useQueryClient();

  if (!usePreferredUnit) {
    return;
  }

  queryClient.prefetchQuery(
    [...WELL_QUERY_KEY.FILTER_OPTIONS, usePreferredUnit],
    () => getFilterOptions(usePreferredUnit)
  );
};
