import * as React from 'react';
import {
  AssetConfigType,
  InternalAssetFilters,
  useDeepMemo,
} from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { getSearchConfig } from '../../../utils';
import {
  extractMatchingLabels,
  MatchingLabelPropertyType,
} from '../../../utils/extractMatchingLabels';
import { extractMatchingLabelsFromCogniteLabels } from '../../../utils/extractMatchingLabelsFromCogniteLabels';
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
  options?: UseInfiniteQueryOptions,
  searchConfig: AssetConfigType = getSearchConfig().asset
) => {
  const { data, ...rest } = useAssetsSearchResultQuery(
    { query, assetFilter, sortBy },
    options,
    searchConfig
  );

  const properties = React.useMemo(() => {
    const arr: MatchingLabelPropertyType[] = [];

    if (searchConfig.id.enabled) {
      arr.push({
        key: 'id',
        label: 'ID',
      });
    }

    if (searchConfig.name.enabled) {
      arr.push({
        key: 'name',
        useSubstringMatch: true,
      });
    }
    if (searchConfig.description.enabled) {
      arr.push({
        key: 'description',
        useSubstringMatch: true,
      });
    }

    if (searchConfig.externalId.enabled) {
      arr.push({
        key: 'externalId',
        label: 'External ID',
      });
    }

    if (searchConfig.source.enabled) {
      arr.push('source');
    }
    if (searchConfig.metadata.enabled) {
      arr.push('metadata');
    }
    if (searchConfig.labels.enabled) {
      arr.push({
        key: 'labels',
        customMatcher: extractMatchingLabelsFromCogniteLabels,
      });
    }

    return arr;
  }, [searchConfig]);

  const mappedData = useDeepMemo(() => {
    if (data && query) {
      return data.map((asset) => {
        return {
          ...asset,
          matchingLabels: extractMatchingLabels(asset, query, properties),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
