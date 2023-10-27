import { useFilesSearchAggregateCountQuery } from '@fdx/services/instances/file/queries/useFilesSearchAggregateCountQuery';
import { useInstanceSearchAggregateQuery } from '@fdx/services/instances/generic/queries/useInstanceSearchAggregatesQuery';
import { useTimeseriesSearchAggregateCountQuery } from '@fdx/services/instances/timeseries/queries/useTimeseriesSearchAggregateCountQuery';

export type SearchTotalCount = {
  totalCount?: number;
  isLoading: boolean;
};

export const useSearchTotalCount = () => {
  const { data: genericResults, isLoading: isGenericLoading } =
    useInstanceSearchAggregateQuery();
  const { data: filesResults, isLoading: isFilesLoading } =
    useFilesSearchAggregateCountQuery();
  const { data: timeseriesResults, isLoading: isTimeseriesLoading } =
    useTimeseriesSearchAggregateCountQuery();

  if (isGenericLoading || isFilesLoading || isTimeseriesLoading) {
    return {
      totalCount: undefined,
      isLoading: true,
    } satisfies SearchTotalCount;
  }

  const genericCount = Object.values(genericResults ?? {}).reduce(
    (acc, value) => acc + value,
    0
  );

  const filesCount = filesResults ?? 0;
  const timeseriesCount = timeseriesResults ?? 0;

  return {
    totalCount: genericCount + filesCount + timeseriesCount,
    isLoading: false,
  } satisfies SearchTotalCount;
};
