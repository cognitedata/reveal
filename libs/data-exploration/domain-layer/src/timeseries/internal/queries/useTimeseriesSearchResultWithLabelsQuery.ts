import * as React from 'react';
import { useDeepMemo } from '@data-exploration-lib/core';
import {
  InternalTimeseriesFilters,
  useTimeseriesSearchResultQuery,
} from '@data-exploration-lib/domain-layer';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { getSearchConfig } from '../../../utils';
import {
  extractMatchingLabels,
  MatchingLabelPropertyType,
} from '../../../utils/extractMatchingLabels';

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

  const timeseriesSearchConfig = getSearchConfig().timeSeries;

  const properties = React.useMemo(() => {
    const arr: MatchingLabelPropertyType[] = [];

    if (timeseriesSearchConfig.id.enabled) {
      arr.push({
        key: 'id',
        label: 'ID',
      });
    }

    if (timeseriesSearchConfig.description.enabled) {
      arr.push({
        key: 'description',
        useSubstringMatch: true,
      });
    }

    if (timeseriesSearchConfig.externalId.enabled) {
      arr.push({
        key: 'externalId',
        label: 'External ID',
      });
    }

    if (timeseriesSearchConfig.name.enabled) {
      arr.push({
        key: 'name',
        useSubstringMatch: true,
      });
    }
    if (timeseriesSearchConfig.metadata.enabled) {
      arr.push('metadata');
    }
    if (timeseriesSearchConfig.unit.enabled) {
      arr.push('unit');
    }

    return arr;
  }, [timeseriesSearchConfig]);

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
