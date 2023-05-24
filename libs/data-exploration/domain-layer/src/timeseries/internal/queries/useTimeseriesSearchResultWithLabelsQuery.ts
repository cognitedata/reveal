import * as React from 'react';
import {
  InternalTimeseriesFilters,
  TimeseriesConfigType,
  useDeepMemo,
} from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from '@tanstack/react-query';
import { TableSortBy } from '../../../types';
import { getSearchConfig } from '../../../utils';
import {
  extractMatchingLabels,
  MatchingLabelPropertyType,
} from '../../../utils/extractMatchingLabels';
import { useTimeseriesSearchResultQuery } from './useTimeseriesSearchResultQuery';

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
  options?: UseInfiniteQueryOptions,
  searchConfig: TimeseriesConfigType = getSearchConfig().timeSeries
) => {
  const { data, ...rest } = useTimeseriesSearchResultQuery(
    { query, filter, sortBy },
    searchConfig,
    options
  );

  const properties = React.useMemo(() => {
    const arr: MatchingLabelPropertyType[] = [];

    if (searchConfig.id.enabled) {
      arr.push({
        key: 'id',
        label: 'ID',
      });
    }

    if (searchConfig.description.enabled) {
      arr.push({
        key: 'description',
        useSubstringMatch: true,
      });
    }

    if (searchConfig.externalId.enabled) {
      arr.push({
        key: 'externalId',
        label: 'External ID',
      });
    }

    if (searchConfig.name.enabled) {
      arr.push({
        key: 'name',
        useSubstringMatch: true,
      });
    }
    if (searchConfig.metadata.enabled) {
      arr.push('metadata');
    }
    if (searchConfig.unit.enabled) {
      arr.push('unit');
    }

    return arr;
  }, [searchConfig]);

  const mappedData = useDeepMemo(() => {
    if (data && query) {
      return data.map((timeseries) => {
        return {
          ...timeseries,
          matchingLabels: extractMatchingLabels(timeseries, query, properties),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
