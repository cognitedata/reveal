import { useQuery, useQueryClient } from 'react-query';

import { ONLY_FETCH_ONCE, WELL_QUERY_KEY } from 'constants/react-query';

import { useUserPreferencesMeasurement } from '../../../hooks/useUserPreferences';
import { getFilterOptions } from '../service';

import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';

export const useWellFilterOptions = () => {
  const v3Enabled = useEnabledWellSdkV3();
  const { data: usePreferredUnit } = useUserPreferencesMeasurement();

  return useQuery(
    [...WELL_QUERY_KEY.FILTER_OPTIONS, usePreferredUnit],
    () => getFilterOptions(usePreferredUnit, v3Enabled),
    {
      ...ONLY_FETCH_ONCE,
      enabled: !!usePreferredUnit && v3Enabled !== undefined,
    }
  );
};

export const usePrefetchWellFilterOptions = () => {
  const { data: usePreferredUnit } = useUserPreferencesMeasurement();
  const queryClient = useQueryClient();
  const v3Enabled = useEnabledWellSdkV3();

  if (!usePreferredUnit || v3Enabled === undefined) {
    return;
  }

  queryClient.prefetchQuery(
    [...WELL_QUERY_KEY.FILTER_OPTIONS, usePreferredUnit],
    () => getFilterOptions(usePreferredUnit, v3Enabled)
  );
};
