import { useMemo } from 'react';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import {
  InternalAssetFilters,
  ResourceTypes,
} from '@data-exploration-lib/core';

import {
  RelationshipsFilterInternal,
  addDetailViewData,
  buildAdvancedFilterFromDetailViewData,
  useRelatedResourceDataForDetailView,
} from '../../../relationships';
import { TableSortBy } from '../../../types';
import { useAssetsListQuery } from '../../service';
import {
  mapFiltersToAssetsAdvancedFilters,
  mapTableSortByToAssetSortFields,
} from '../transformers';

export const useRelatedAssetsQuery = ({
  resourceExternalId,
  relationshipFilter,
  assetFilter = {},
  query,
  sortBy,
  enabled = true,
}: {
  resourceExternalId?: string;
  relationshipFilter?: RelationshipsFilterInternal;
  assetFilter?: InternalAssetFilters;
  query?: string;
  sortBy?: TableSortBy[];
  enabled?: boolean;
}) => {
  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: resourceExternalId,
      relationshipResourceType: ResourceTypes.Asset,
      filter: relationshipFilter,
      options: { enabled },
    });

  const advancedFilter = useMemo(() => {
    return {
      and: compact([
        buildAdvancedFilterFromDetailViewData(detailViewRelatedResourcesData),
        mapFiltersToAssetsAdvancedFilters(assetFilter, query),
      ]),
    };
  }, [assetFilter, detailViewRelatedResourcesData, query]);

  const sort = useMemo(() => mapTableSortByToAssetSortFields(sortBy), [sortBy]);

  const hasRelatedAssets = !isEmpty(detailViewRelatedResourcesData);

  const {
    data = [],
    isLoading,
    ...rest
  } = useAssetsListQuery(
    {
      advancedFilter,
      sort,
      limit: 20,
    },
    {
      enabled: hasRelatedAssets && enabled,
      keepPreviousData: true,
    }
  );

  const transformedData = useMemo(() => {
    return addDetailViewData(data, detailViewRelatedResourcesData);
  }, [data, detailViewRelatedResourcesData]);

  return {
    data: transformedData,
    isLoading: hasRelatedAssets && isLoading,
    ...rest,
  };
};
