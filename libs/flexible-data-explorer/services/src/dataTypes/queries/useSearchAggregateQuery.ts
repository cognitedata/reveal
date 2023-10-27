import { useMemo } from 'react';

import { useFilesSearchAggregateCountQuery } from '../../instances/file/queries/useFilesSearchAggregateCountQuery';
import { useInstanceSearchAggregateQuery } from '../../instances/generic/queries/useInstanceSearchAggregatesQuery';
import { useTimeseriesSearchAggregateCountQuery } from '../../instances/timeseries/queries/useTimeseriesSearchAggregateCountQuery';

export const useSearchAggregateQuery = () => {
  const { data: genericCount, isLoading: isGenericLoading } =
    useInstanceSearchAggregateQuery();
  const { data: fileCount, isLoading: isFilesLoading } =
    useFilesSearchAggregateCountQuery();
  const { data: timeseriesCount, isLoading: isTimeseriesLoading } =
    useTimeseriesSearchAggregateCountQuery();

  const data = useMemo(() => {
    return {
      ...genericCount,
      File: fileCount,
      TimeSeries: timeseriesCount,
    } as Record<string, number>;
  }, [genericCount, fileCount, timeseriesCount]);

  if (isGenericLoading || isFilesLoading || isTimeseriesLoading) {
    return { data: undefined, isLoading: true };
  }

  return {
    data,
  };
};
