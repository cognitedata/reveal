import * as React from 'react';

import {
  EventConfigType,
  InternalEventsFilters,
  useDeepMemo,
} from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from '@tanstack/react-query';

import { TableSortBy } from '../../../types';
import { getSearchConfig } from '../../../utils';
import {
  extractMatchingLabels,
  MatchingLabelPropertyType,
} from '../../../utils/extractMatchingLabels';

import { useEventsSearchResultQuery } from './useEventsSearchResultQuery';

export const useEventsSearchResultWithLabelsQuery = (
  {
    query,
    eventsFilters = {},
    eventsSortBy,
  }: {
    query?: string;
    eventsFilters: InternalEventsFilters;
    eventsSortBy?: TableSortBy[];
  },
  searchConfig: EventConfigType = getSearchConfig().event,
  options?: UseInfiniteQueryOptions
) => {
  const { data, ...rest } = useEventsSearchResultQuery(
    { query, eventsFilters, eventsSortBy },
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

    if (searchConfig.source.enabled) {
      arr.push('source');
    }
    if (searchConfig.metadata.enabled) {
      arr.push('metadata');
    }
    if (searchConfig.type.enabled) {
      arr.push('type');
    }

    if (searchConfig.subtype.enabled) {
      arr.push('subtype');
    }

    return arr;
  }, [searchConfig]);

  const mappedData = useDeepMemo(() => {
    if (data && query) {
      return data.map((event) => {
        return {
          ...event,
          matchingLabels: extractMatchingLabels(event, query, properties),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
