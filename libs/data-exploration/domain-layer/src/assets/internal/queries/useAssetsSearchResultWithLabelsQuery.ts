import * as React from 'react';
import { useDeepMemo } from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { getSearchConfig } from '../../../utils';
import {
  extractMatchingLabels,
  MatchingLabelPropertyType,
} from '../../../utils/extractMatchingLabels';
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

  const assetSearchConfig = getSearchConfig().asset;

  const properties = React.useMemo(() => {
    const arr: MatchingLabelPropertyType[] = [];

    if (assetSearchConfig.id.enabled) {
      arr.push({
        key: 'id',
        label: 'ID',
      });
    }

    if (assetSearchConfig.name.enabled) {
      arr.push({
        key: 'name',
        useSubstringMatch: true,
      });
    }
    if (assetSearchConfig.description.enabled) {
      arr.push({
        key: 'description',
        useSubstringMatch: true,
      });
    }

    if (assetSearchConfig.externalId.enabled) {
      arr.push({
        key: 'externalId',
        label: 'External ID',
      });
    }

    if (assetSearchConfig.source.enabled) {
      arr.push('source');
    }
    if (assetSearchConfig.metadata.enabled) {
      arr.push('metadata');
    }
    if (assetSearchConfig.labels.enabled) {
      arr.push({
        key: 'labels',
        customMatcher: extractMatchingLabelsFromCogniteLabels,
      });
    }

    return arr;
  }, [assetSearchConfig]);

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
