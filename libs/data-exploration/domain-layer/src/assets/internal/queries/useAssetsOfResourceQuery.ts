import { useMemo } from 'react';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import {
  InternalAssetFilters,
  ResourceItem,
  convertResourceType,
} from '@data-exploration-lib/core';

import { useAssetIdsQuery } from '../../../counts';
import { TableSortBy } from '../../../types';
import { useAssetsListQuery } from '../../service';
import {
  mapFiltersToAssetsAdvancedFilters,
  mapTableSortByToAssetSortFields,
} from '../transformers';

export const useAssetsOfResourceQuery = ({
  resource,
  filter = {},
  query,
  sortBy,
  isDocumentsApiEnabled = true,
}: {
  resource: ResourceItem;
  filter?: InternalAssetFilters;
  query?: string;
  sortBy?: TableSortBy[];
  isDocumentsApiEnabled?: boolean;
}) => {
  const { data: assetIds = [] } = useAssetIdsQuery({
    resourceType: convertResourceType(resource.type),
    resourceId: { id: resource.id },
    isDocumentsApiEnabled,
  });

  const assetIdsFilter = useMemo(() => {
    if (isEmpty(assetIds)) {
      return undefined;
    }

    return {
      in: {
        property: ['id'],
        values: assetIds,
      },
    };
  }, [assetIds]);

  const advancedFilter = useMemo(() => {
    return {
      and: compact([
        assetIdsFilter,
        mapFiltersToAssetsAdvancedFilters(filter, query),
      ]),
    };
  }, [filter, assetIdsFilter, query]);

  const sort = useMemo(() => mapTableSortByToAssetSortFields(sortBy), [sortBy]);

  const hasAssets = !isEmpty(assetIds);

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
    { enabled: hasAssets }
  );

  return {
    data,
    isLoading: hasAssets && isLoading,
    ...rest,
  };
};
