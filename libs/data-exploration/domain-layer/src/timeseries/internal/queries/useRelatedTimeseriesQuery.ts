import { useMemo } from 'react';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import {
  InternalTimeseriesFilters,
  ResourceTypes,
} from '@data-exploration-lib/core';

import {
  RelationshipsFilterInternal,
  addDetailViewData,
  buildAdvancedFilterFromDetailViewData,
  useRelatedResourceDataForDetailView,
} from '../../../relationships';
import { TableSortBy } from '../../../types';
import { useTimeseriesListQuery } from '../../service';
import {
  mapFiltersToTimeseriesAdvancedFilters,
  mapTableSortByToTimeseriesSortFields,
} from '../transformers';

export const useRelatedTimeseriesQuery = ({
  resourceExternalId,
  relationshipFilter,
  timeseriesFilter = {},
  query,
  sortBy,
}: {
  resourceExternalId?: string;
  relationshipFilter?: RelationshipsFilterInternal;
  timeseriesFilter?: InternalTimeseriesFilters;
  query?: string;
  sortBy?: TableSortBy[];
}) => {
  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: resourceExternalId,
      relationshipResourceType: ResourceTypes.TimeSeries,
      filter: relationshipFilter,
    });

  const advancedFilter = useMemo(() => {
    return {
      and: compact([
        buildAdvancedFilterFromDetailViewData(detailViewRelatedResourcesData),
        mapFiltersToTimeseriesAdvancedFilters(timeseriesFilter, query),
      ]),
    };
  }, [timeseriesFilter, detailViewRelatedResourcesData, query]);

  const sort = useMemo(
    () => mapTableSortByToTimeseriesSortFields(sortBy),
    [sortBy]
  );

  const hasRelatedTimeseries = !isEmpty(detailViewRelatedResourcesData);

  const {
    data = [],
    isLoading,
    ...rest
  } = useTimeseriesListQuery(
    {
      advancedFilter,
      sort,
      limit: 20,
    },
    { enabled: hasRelatedTimeseries }
  );

  const transformedData = useMemo(() => {
    return addDetailViewData(data, detailViewRelatedResourcesData);
  }, [data, detailViewRelatedResourcesData]);

  return {
    data: transformedData,
    isLoading: hasRelatedTimeseries && isLoading,
    ...rest,
  };
};
