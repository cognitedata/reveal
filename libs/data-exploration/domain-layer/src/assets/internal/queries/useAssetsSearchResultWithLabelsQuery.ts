import { useDeepMemo } from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { extractMatchingLabels } from '../../../utils/extractMatchingLabels';
import { InternalAssetFilters } from '../types';
import { useAssetsSearchResultQuery } from './useAssetsFilteredListQuery';

export const useAssetsSearchResultWithLabelsQuery = (
  {
    query,
    assetFilter = {},
    sortBy,
  }: {
    query?: string;
    assetFilter: InternalAssetFilters;
    sortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  const { data, ...rest } = useAssetsSearchResultQuery(
    { query, assetFilter, sortBy },
    options
  );

  const mappedData = useDeepMemo(() => {
    if (data && query) {
      return data.map((asset) => {
        return {
          ...asset,
          matchingLabels: extractMatchingLabels(asset, query, [
            {
              key: 'id',
              label: 'ID',
            },
            'name',
            'description',
            'metadata',
            'source',
            {
              key: 'externalId',
              label: 'External ID',
            },
            {
              key: 'labelsFlattened',
              label: 'Label',
            },
          ]),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
