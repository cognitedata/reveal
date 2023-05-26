import { useMemo } from 'react';

import { InternalEventsFilters } from '@data-exploration-lib/core';
import omit from 'lodash/omit';

import { getAssetSubtreeIdFilter } from '../../../utils';
import { mergeDynamicFilterOptions } from '../../../utils/mergeDynamicFilterOptions';
import { EventProperty, useEventsUniqueValuesByProperty } from '../../service';
import { mapFiltersToEventsAdvancedFilters } from '../transformers';

interface Props {
  property: EventProperty;
  /**
   * If the property is different from what we input for transformer.
   * Example: source and sources
   * Better to fix this in future and remove this.
   */
  filterProperty?: string;
  searchQuery?: string;
  filter?: InternalEventsFilters;
  query?: string;
}

export const useEventsFilterOptions = ({
  property,
  filterProperty,
  searchQuery,
  filter = {},
  query,
}: Props) => {
  const {
    data = [],
    isLoading,
    isError,
  } = useEventsUniqueValuesByProperty({
    property,
    query,
  });

  const omittedFilter = omit(filter, filterProperty || property);

  const { data: dynamicData = [] } = useEventsUniqueValuesByProperty({
    property,
    advancedFilter: mapFiltersToEventsAdvancedFilters(
      omittedFilter,
      searchQuery
    ),
    /**
     * In asset detailed view, we need to filter events according to selected assetSubtreeIds.
     * But assetSubtreeIds not supported in advanced filter.
     * so we have to use filter for that.
     */
    filter: getAssetSubtreeIdFilter(omittedFilter),
    query,
  });

  const options = useMemo(() => {
    return mergeDynamicFilterOptions(data, dynamicData);
  }, [data, dynamicData]);

  return {
    options,
    isLoading,
    isError,
  };
};
