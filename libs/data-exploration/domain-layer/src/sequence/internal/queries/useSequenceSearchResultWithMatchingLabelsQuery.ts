import * as React from 'react';
import { EMPTY_OBJECT, useDeepMemo } from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { getSearchConfig } from '../../../utils';
import {
  extractMatchingLabels,
  MatchingLabelPropertyType,
} from '../../../utils/extractMatchingLabels';
import { InternalSequenceFilters } from '../types';
import { useSequenceSearchResultQuery } from './useSequenceSearchResultQuery';

export const useSequenceSearchResultWithMatchingLabelsQuery = (
  {
    query,
    filter = EMPTY_OBJECT,
    sortBy,
  }: {
    query?: string;
    filter: InternalSequenceFilters;
    sortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  const { data, ...rest } = useSequenceSearchResultQuery(
    { query, filter, sortBy },
    options
  );

  const sequenceSearchConfig = getSearchConfig().sequence;

  const properties = React.useMemo(() => {
    const arr: MatchingLabelPropertyType[] = [];

    if (sequenceSearchConfig.id.enabled) {
      arr.push({
        key: 'id',
        label: 'ID',
      });
    }

    if (sequenceSearchConfig.description.enabled) {
      arr.push({
        key: 'description',
        useSubstringMatch: true,
      });
    }

    if (sequenceSearchConfig.externalId.enabled) {
      arr.push({
        key: 'externalId',
        label: 'External ID',
      });
    }

    if (sequenceSearchConfig.name.enabled) {
      arr.push({
        key: 'name',
        useSubstringMatch: true,
      });
    }
    if (sequenceSearchConfig.metadata.enabled) {
      arr.push('metadata');
    }

    return arr;
  }, [sequenceSearchConfig]);

  const mappedData = useDeepMemo(() => {
    if (data && query) {
      return data.map((sequence) => {
        return {
          ...sequence,
          matchingLabels: extractMatchingLabels(sequence, query, properties),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
