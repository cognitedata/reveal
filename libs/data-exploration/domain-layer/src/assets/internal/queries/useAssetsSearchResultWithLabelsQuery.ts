import { useDeepMemo } from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { extractMatchingLabels } from '../../../utils/extractMatchingLabels';
import { extractMatchingLabelsFromCogniteLabels } from '../../../utils/extractMatchingLabelsFromCogniteLabels';
import { InternalAssetFilters } from '../types';
import { useAssetsSearchResultQuery } from './useAssetsSearchResultQuery';

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
            {
              key: 'name',
              useSubstringMatch: true,
            },
            {
              key: 'description',
              useSubstringMatch: true,
            },
            'metadata',
            'source',
            {
              key: 'externalId',
              label: 'External ID',
            },
            {
              key: 'labels',
              customMatcher: extractMatchingLabelsFromCogniteLabels,
            },
          ]),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
