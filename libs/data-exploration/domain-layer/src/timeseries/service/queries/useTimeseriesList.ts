import { useList } from '@cognite/sdk-react-query-hooks';
import { transformNewFilterToOldFilter } from '../../../transformers';

export const useTimeseriesList = (
  timeseriesFilter: any,
  isAdvancedFiltersEnabled = false
) => {
  const { data: items = [], ...rest } = useList<any>('timeseries', {
    filter: isAdvancedFiltersEnabled
      ? {}
      : transformNewFilterToOldFilter(timeseriesFilter),
    limit: 1000,
  });

  return { items, ...rest };
};
