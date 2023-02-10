import { useDeepMemo } from '@data-exploration-lib/core';
import {
  InternalTimeseriesFilters,
  useTimeseriesSearchResultQuery,
} from '@data-exploration-lib/domain-layer';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { extractMatchingLabels } from '../../../utils/extractMatchingLabels';

export const useTimeseriesSearchResultWithLabelsQuery = (
  {
    query,
    filter,
    sortBy,
  }: {
    query?: string;
    filter: InternalTimeseriesFilters;
    sortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  const { data, ...rest } = useTimeseriesSearchResultQuery(
    { query, filter, sortBy },
    options
  );

  const mappedData = useDeepMemo(() => {
    if (data && query) {
      return data.map((timeseries) => {
        return {
          ...timeseries,
          matchingLabels: extractMatchingLabels(timeseries, query, [
            {
              key: 'id',
              label: 'ID',
            },
            'name',
            'description',
            'metadata',
            'unit',
            {
              key: 'externalId',
              label: 'External ID',
            },
          ]),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
