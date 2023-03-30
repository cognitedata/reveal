import {
  AssetConfigType,
  InternalAssetFilters,
  isNumeric,
  METADATA_ALL_VALUE,
} from '@data-exploration-lib/core';
import {
  AdvancedFilter,
  AdvancedFilterBuilder,
  NIL_FILTER_VALUE,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';

import { getSearchConfig } from '../../../utils';

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
    for (const { key, value } of metadata) {
      if (value === METADATA_ALL_VALUE) {
        filterBuilder.exists(`metadata|${key}`);
      } else {
        filterBuilder.equals(`metadata|${key}`, value);
      }
    }
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

    /**
     * We want to filter all the metadata keys with the search query, to give a better result
     * to the user when using our search.
     */
    if (searchConfig.metadata.enabled) {
      searchQueryBuilder.prefix(`metadata`, query);
    }

    if (isNumeric(query) && searchConfig.id.enabled) {
      searchQueryBuilder.equals('id', Number(query));
    }

    if (searchConfig.externalId.enabled) {
      searchQueryBuilder.prefix('externalId', query);
    }
    if (searchConfig.source.enabled) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // the type here is a bit wrong, will be refactored in later PRs
      searchQueryBuilder.prefix('source', query);
    }

    if (searchConfig.labels.enabled) {
      searchQueryBuilder.containsAny('labels', [query]);
    }

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<AssetsProperties>().and(builder).build();
};
