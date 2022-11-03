import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import isEmpty from 'lodash/isEmpty';
import { InternalAssetFilters } from '../types';

export type AssetsProperties = {
  assetSubtreeIds: number[];
  dataSetIds: number[];
  source: string[];
  externalId: string;
  labels: string[];
  description: string;
  name: string;
  [key: `metadata|${string}`]: string;
};

export const mapFiltersToAssetsAdvancedFilters = (
  {
    source,
    metadata,
    createdTime,
    lastUpdatedTime,
    externalIdPrefix,
    dataSetIds,
  }: InternalAssetFilters,
  searchQueryMetadataKeys?: Record<string, string>,
  query?: string
): AdvancedFilter<AssetsProperties> | undefined => {
  const filterBuilder = new AdvancedFilterBuilder<AssetsProperties>()
    .containsAny('dataSetIds', () => {
      return dataSetIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .in('source', () => {
      if (source) {
        return [source];
      }
    })
    .prefix('externalId', externalIdPrefix)
    .range('createdTime', {
      lte: createdTime?.max as number,
      gte: createdTime?.min as number,
    })
    .range('lastUpdatedTime', {
      lte: lastUpdatedTime?.max as number,
      gte: lastUpdatedTime?.min as number,
    })
    .search('name', isEmpty(query) ? undefined : query)
    .search('description', isEmpty(query) ? undefined : query);

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      filterBuilder.equals(`metadata|${key}`, value);
    }
  }

  /**
   * We want to filter all the metadata keys with the search query, to give a better result
   * to the user when using our search.
   */
  if (searchQueryMetadataKeys) {
    const searchBuilder = new AdvancedFilterBuilder<AssetsProperties>();

    for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
      searchBuilder.prefix(`metadata|${key}`, value);
    }

    filterBuilder.or(searchBuilder);
  }

  return new AdvancedFilterBuilder<AssetsProperties>()
    .and(filterBuilder)
    .build();
};
