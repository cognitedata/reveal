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
  enabled = true,
}: {
  resourceExternalId?: string;
  relationshipFilter?: RelationshipsFilterInternal;
  sequenceFilter?: InternalSequenceFilters;
  query?: string;
  sortBy?: TableSortBy[];
  enabled?: boolean;
}) => {
  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: resourceExternalId,
      relationshipResourceType: ResourceTypes.Sequence,
      filter: relationshipFilter,
      options: { enabled },
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

  const hasRelatedSequences = !isEmpty(detailViewRelatedResourcesData);

  const {
    data = [],
    isLoading,
    ...rest
  } = useSequenceListQuery(
    {
      advancedFilter,
      sort,
      limit: 20,
    },
    { enabled: hasRelatedSequences }
  );

  const transformedData = useMemo(() => {
    return addDetailViewData(data, detailViewRelatedResourcesData);
  }, [data, detailViewRelatedResourcesData]);

  return {
    data: transformedData,
    isLoading: hasRelatedSequences && isLoading,
    ...rest,
  };
};
