import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import { InternalAssetFilters } from '../types';

export type AssetsProperties = {
  assetSubtreeIds: number[];
  dataSetId: number[];
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
  query?: string,
  searchQueryMetadataKeys?: Record<string, string>
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
    });

  if (metadata) {
    for (const { key, value } of metadata) {
      filterBuilder.equals(`metadata|${key}`, value);
    }
  }

  if (query) {
    const searchQueryBuilder = new AdvancedFilterBuilder<AssetsProperties>()
      .search('name', query)
      .search('description', query);

    filterBuilder.or(searchQueryBuilder);
  }

  builder.and(filterBuilder);

  /**
   * We want to filter all the metadata keys with the search query, to give a better result
   * to the user when using our search.
   */
  if (searchQueryMetadataKeys) {
    const searchMetadataBuilder = new AdvancedFilterBuilder<AssetsProperties>();

    for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
      searchMetadataBuilder.prefix(`metadata|${key}`, value);
    }

    builder.or(searchMetadataBuilder);
  }

  return new AdvancedFilterBuilder<AssetsProperties>().or(builder).build();
};
