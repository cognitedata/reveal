import isEmpty from 'lodash/isEmpty';

import {
  AssetConfigType,
  InternalAssetFilters,
  isNumeric,
  METADATA_ALL_VALUE,
} from '@data-exploration-lib/core';

import { AdvancedFilter, AdvancedFilterBuilder } from '../../../builders';
import { NIL_FILTER_VALUE } from '../../../constants';
import { getSearchConfig } from '../../../utils';

export type AssetsProperties = {
  assetSubtreeIds: number[];
  dataSetId: number[];
  source: string[];
  externalId: string | string[];
  labels: string[];
  description: string;
  name: string;
  id: number;
  parentId: number;
  metadata: string;
  [key: `metadata|${string}`]: string;
  assetIds: number[];
};

export const mapFiltersToAssetsAdvancedFilters = (
  {
    dataSetIds,
    createdTime,
    lastUpdatedTime,
    externalIdPrefix,
    sources,
    labels,
    metadata,
    internalId,
    assetIds,
    parentIds,
  }: InternalAssetFilters,
  query?: string,
  searchConfig: AssetConfigType = getSearchConfig().asset
): AdvancedFilter<AssetsProperties> | undefined => {
  const builder = new AdvancedFilterBuilder<AssetsProperties>();

  const filterBuilder = new AdvancedFilterBuilder<AssetsProperties>()
    .in('dataSetId', () => {
      return dataSetIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .or(
      new AdvancedFilterBuilder<AssetsProperties>()
        .containsAny('labels', () => {
          return labels?.reduce((acc, { value }) => {
            if (value !== NIL_FILTER_VALUE) {
              return [...acc, value];
            }
            return acc;
          }, [] as string[]);
        })
        .notExists('labels', () => {
          return Boolean(
            labels?.find(({ value }) => value === NIL_FILTER_VALUE)
          );
        })
    )
    .or(
      new AdvancedFilterBuilder<AssetsProperties>()
        .in('source', () => {
          return sources?.reduce((acc, { value }) => {
            if (value !== NIL_FILTER_VALUE) {
              return [...acc, value];
            }
            return acc;
          }, [] as string[]);
        })
        .notExists('source', () => {
          return Boolean(
            sources?.find(({ value }) => value === NIL_FILTER_VALUE)
          );
        })
    )
    .equals('id', internalId)
    .prefix('externalId', externalIdPrefix)
    .range('createdTime', {
      lte: createdTime?.max as number,
      gte: createdTime?.min as number,
    })
    .range('lastUpdatedTime', {
      lte: lastUpdatedTime?.max as number,
      gte: lastUpdatedTime?.min as number,
    });

  if (metadata) {
    const metadataBuilder = new AdvancedFilterBuilder<AssetsProperties>();
    for (const { key, value } of metadata) {
      if (value === METADATA_ALL_VALUE) {
        metadataBuilder.exists(`metadata|${key}`);
      } else {
        metadataBuilder.equals(`metadata|${key}`, value);
      }
    }
    filterBuilder.or(metadataBuilder);
  }

  if (assetIds && !isEmpty(assetIds)) {
    const assetIdsBuilder = new AdvancedFilterBuilder<AssetsProperties>();
    assetIds.forEach((id) => {
      assetIdsBuilder.equals('id', id.value);
    });
    filterBuilder.or(assetIdsBuilder);
  }

  if (parentIds && !isEmpty(parentIds)) {
    const parentIdsBuilder = new AdvancedFilterBuilder<AssetsProperties>();
    parentIds.forEach((id) => {
      parentIdsBuilder.equals('parentId', id.value);
    });
    filterBuilder.or(parentIdsBuilder);
  }

  builder.and(filterBuilder);

  if (query && !isEmpty(query)) {
    const searchQueryBuilder = new AdvancedFilterBuilder<AssetsProperties>();

    if (searchConfig.name.enabled) {
      searchQueryBuilder.equals('name', query);
      searchQueryBuilder.prefix('name', query);

      if (searchConfig.name.enabledFuzzySearch) {
        searchQueryBuilder.search('name', query);
      }
    }

    if (searchConfig.description.enabled) {
      searchQueryBuilder.equals('description', query);
      searchQueryBuilder.prefix('description', query);

      if (searchConfig.description.enabledFuzzySearch) {
        searchQueryBuilder.search('description', query);
      }
    }

    if (searchConfig.metadata.enabled) {
      /**
       * We want to filter all the metadata keys with the search query, to give a better result
       * to the user when using our search.
       */
      searchQueryBuilder.equals('metadata', query);
      searchQueryBuilder.prefix(`metadata`, query);
    }

    if (isNumeric(query) && searchConfig.id.enabled) {
      searchQueryBuilder.equals('id', Number(query));
    }

    if (searchConfig.externalId.enabled) {
      searchQueryBuilder.equals('externalId', query);
      searchQueryBuilder.prefix('externalId', query);
    }
    if (searchConfig.source.enabled) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // the type here is a bit wrong, will be refactored in later PRs
      // @ts-ignore
      searchQueryBuilder.equals('source', query);
      // @ts-ignore
      searchQueryBuilder.prefix('source', query);
    }

    if (searchConfig.labels.enabled) {
      searchQueryBuilder.containsAny('labels', [query]);
    }

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<AssetsProperties>().and(builder).build();
};
