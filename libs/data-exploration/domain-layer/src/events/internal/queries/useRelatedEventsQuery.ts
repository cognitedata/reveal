import { useMemo } from 'react';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import {
  InternalEventsFilters,
  ResourceTypes,
} from '@data-exploration-lib/core';

import {
  RelationshipsFilterInternal,
  addDetailViewData,
  buildAdvancedFilterFromDetailViewData,
  useRelatedResourceDataForDetailView,
} from '../../../relationships';
import { TableSortBy } from '../../../types';
import { useEventsListQuery } from '../../service';
import {
  mapFiltersToEventsAdvancedFilters,
  mapTableSortByToEventSortFields,
} from '../transformers';

export const useRelatedEventsQuery = ({
  resourceExternalId,
  relationshipFilter,
  eventFilter = {},
  query,
  sortBy,
  enabled = true,
}: {
  resourceExternalId?: string;
  relationshipFilter?: RelationshipsFilterInternal;
  eventFilter?: InternalEventsFilters;
  query?: string;
  sortBy?: TableSortBy[];
  enabled?: boolean;
}) => {
  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: resourceExternalId,
      relationshipResourceType: ResourceTypes.Event,
      filter: relationshipFilter,
      options: { enabled },
    });

  const advancedFilter = useMemo(() => {
    return {
      and: compact([
        buildAdvancedFilterFromDetailViewData(detailViewRelatedResourcesData),
        mapFiltersToEventsAdvancedFilters(eventFilter, query),
      ]),
    };
  }, [eventFilter, detailViewRelatedResourcesData, query]);

  const sort = useMemo(() => mapTableSortByToEventSortFields(sortBy), [sortBy]);

  const hasRelatedEvents = !isEmpty(detailViewRelatedResourcesData);

  const {
    data = [],
    isLoading,
    ...rest
  } = useEventsListQuery(
    {
      advancedFilter,
      sort,
      limit: 20,
    },
    {
      enabled: hasRelatedEvents,
      keepPreviousData: true,
    }
  );

  const transformedData = useMemo(() => {
    return addDetailViewData(data, detailViewRelatedResourcesData);
  }, [data, detailViewRelatedResourcesData]);

  return {
    data: transformedData,
    isLoading: hasRelatedEvents && isLoading,
    ...rest,
  };
};
