import { useMemo } from 'react';

import { InternalEventsFilters } from '@data-exploration-lib/core';

import keyBy from 'lodash/keyBy';
import orderBy from 'lodash/orderBy';
import omit from 'lodash/omit';

import { EventProperty } from '../types';
import { useEventsUniqueValuesByProperty } from './useEventsUniqueValuesByProperty';
import { mapFiltersToEventsAdvancedFilters } from '@data-exploration-lib/domain-layer';
import { getSearchConfig } from '../../../utils';

interface Props {
  property: EventProperty;
  /**
   * If the property is different from what we input for transformer.
   * Example: source and sources
   * Better to fix this in future and remove this.
   */
  filterProperty?: string;
  query?: string;
  filter?: InternalEventsFilters;
}

export const useEventsFilterOptions = ({
  property,
  filterProperty,
  query,
  filter = {},
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useEventsUniqueValuesByProperty({
    property,
    query,
    options: {
      keepPreviousData: true,
    },
  });

  const { data: dynamicData = [] } = useEventsUniqueValuesByProperty({
    property,
    query,
    advancedFilter: mapFiltersToEventsAdvancedFilters(
      omit(filter, filterProperty || property),
      query,
      getSearchConfig().event
    ),
    options: {
      keepPreviousData: true,
    },
  });

  const options = useMemo(() => {
    const keyedDynamicData = keyBy(dynamicData, 'value');

    const unsortedOptions = data.map((item) => ({
      label: String(item.value),
      value: String(item.value),
      count: keyedDynamicData[item.value]?.count || 0,
    }));

    return orderBy(unsortedOptions, 'count', 'desc');
  }, [data, dynamicData]);

  return {
    options,
    isLoading,
    isError,
  };
};
