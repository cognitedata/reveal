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
}: {
  resourceExternalId?: string;
  relationshipFilter?: RelationshipsFilterInternal;
  eventFilter?: InternalEventsFilters;
  query?: string;
  sortBy?: TableSortBy[];
}) => {
  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: resourceExternalId,
      relationshipResourceType: ResourceTypes.Event,
      filter: relationshipFilter,
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

  const { data = [], ...rest } = useEventsListQuery(
    {
      advancedFilter,
      sort,
      limit: 20,
    },
    { enabled: !isEmpty(detailViewRelatedResourcesData) }
  );

  const transformedData = useMemo(() => {
    return addDetailViewData(data, detailViewRelatedResourcesData);
  }, [data, detailViewRelatedResourcesData]);

  return { data: transformedData, ...rest };
};
