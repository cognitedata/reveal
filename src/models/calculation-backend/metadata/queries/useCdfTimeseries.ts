/**
 * Get CDF Timeseries
 */

import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';

export default function useCdfTimeseries(id = 0) {
  const { data, isFetching, error } = useCdfItem<Timeseries>(
    'timeseries',
    { id },
    { enabled: !!id, refetchOnWindowFocus: false }
  );

  return {
    timeseries: data,
    isLoading: isFetching,
    error,
  };
}
