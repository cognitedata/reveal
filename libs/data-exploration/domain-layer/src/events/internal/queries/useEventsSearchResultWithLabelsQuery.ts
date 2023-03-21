import * as React from 'react';
import { TableSortBy } from '../../../types';
import { InternalEventsFilters } from '../types';
import { useEventsSearchResultQuery } from './useEventsSearchResultQuery';
import { UseInfiniteQueryOptions } from 'react-query';
import { useDeepMemo } from '@data-exploration-lib/core';
import {
  extractMatchingLabels,
  MatchingLabelPropertyType,
} from '../../../utils/extractMatchingLabels';
import { getSearchConfig } from '../../../utils';

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
  options?: UseInfiniteQueryOptions
) => {
  const { data, ...rest } = useEventsSearchResultQuery(
    { query, eventsFilters, eventsSortBy },
    options
  );

  const eventSearchConfig = getSearchConfig().event;

  const properties = React.useMemo(() => {
    const arr: MatchingLabelPropertyType[] = [];

    if (eventSearchConfig.id.enabled) {
      arr.push({
        key: 'id',
        label: 'ID',
      });
    }

    if (eventSearchConfig.description.enabled) {
      arr.push({
        key: 'description',
        useSubstringMatch: true,
      });
    }

    if (eventSearchConfig.externalId.enabled) {
      arr.push({
        key: 'externalId',
        label: 'External ID',
      });
    }

    if (eventSearchConfig.source.enabled) {
      arr.push('source');
    }
    if (eventSearchConfig.metadata.enabled) {
      arr.push('metadata');
    }
    if (eventSearchConfig.type.enabled) {
      arr.push('type');
    }

    if (eventSearchConfig.subtype.enabled) {
      arr.push('subtype');
    }

    return arr;
  }, [eventSearchConfig]);

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
