import { isNumeric, searchConfigData } from '@data-exploration-lib/core';
import {
  AdvancedFilter,
  AdvancedFilterBuilder,
  NIL_FILTER_VALUE,
} from '@data-exploration-lib/domain-layer';

import { InternalAssetFilters } from '../types';

export type AssetsProperties = {
  assetSubtreeIds: number[];
  dataSetId: number[];
  source: string[];
  externalId: string;
  labels: string[];
  description: string;
  name: string;
  id: number;
  metadata: string;
  [key: `metadata|${string}`]: string;
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
  }: InternalAssetFilters,
  query?: string
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
    for (const { key, value } of metadata) {
      filterBuilder.equals(`metadata|${key}`, value);
    }
  }

  builder.and(filterBuilder);

  if (query) {
    const searchQueryBuilder = new AdvancedFilterBuilder<AssetsProperties>();

    if (searchConfigData.asset.name) {
      searchQueryBuilder.search('name', query);
    }

    if (searchConfigData.asset.description) {
      searchQueryBuilder.search('description', query);
    }

    /**
     * We want to filter all the metadata keys with the search query, to give a better result
     * to the user when using our search.
     */
    if (searchConfigData.asset.metadata) {
      searchQueryBuilder.prefix(`metadata`, query);
    }

    if (isNumeric(query) && searchConfigData.asset.id) {
      searchQueryBuilder.equals('id', Number(query));
    }

    if (searchConfigData.asset.externalId) {
      searchQueryBuilder.prefix('externalId', query);
    }
    if (searchConfigData.asset.source) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // the type here is a bit wrong, will be refactored in later PRs
      searchQueryBuilder.prefix('source', query);
    }

    if (searchConfigData.asset.labels) {
      searchQueryBuilder.containsAny('labels', [query]);
    }

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<AssetsProperties>().and(builder).build();
};
