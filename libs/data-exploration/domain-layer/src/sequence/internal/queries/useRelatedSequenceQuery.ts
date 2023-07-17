import { useMemo } from 'react';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import {
  InternalSequenceFilters,
  ResourceTypes,
} from '@data-exploration-lib/core';

import {
  RelationshipsFilterInternal,
  addDetailViewData,
  buildAdvancedFilterFromDetailViewData,
  useRelatedResourceDataForDetailView,
} from '../../../relationships';
import { TableSortBy } from '../../../types';
import { useSequenceListQuery } from '../../service';
import {
  mapFiltersToSequenceAdvancedFilters,
  mapTableSortByToSequenceSortFields,
} from '../transformers';

export const useRelatedSequenceQuery = ({
  resourceExternalId,
  relationshipFilter,
  sequenceFilter = {},
  query,
  sortBy,
}: {
  resourceExternalId?: string;
  relationshipFilter?: RelationshipsFilterInternal;
  sequenceFilter?: InternalSequenceFilters;
  query?: string;
  sortBy?: TableSortBy[];
}) => {
  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: resourceExternalId,
      relationshipResourceType: ResourceTypes.Sequence,
      filter: relationshipFilter,
    });

  const advancedFilter = useMemo(() => {
    return {
      and: compact([
        buildAdvancedFilterFromDetailViewData(detailViewRelatedResourcesData),
        mapFiltersToSequenceAdvancedFilters(sequenceFilter, query),
      ]),
    };
  }, [sequenceFilter, detailViewRelatedResourcesData, query]);

  const sort = useMemo(
    () => mapTableSortByToSequenceSortFields(sortBy),
    [sortBy]
  );

  const { data = [], ...rest } = useSequenceListQuery(
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
