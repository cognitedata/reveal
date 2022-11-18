import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import { NIL_FILTER_VALUE } from 'domain/constants';
import { InternalAssetFilters } from '../types';
import { AssetsAdvancedFilterBuilder } from './assetsAdvancedFilterBuilder';

export type AssetsProperties = {
  assetSubtreeIds: number[];
  dataSetId: number[];
  source: string[];
  externalId: string;
  labels: string[];
  description: string;
  name: string;
  id: number[];
  [key: `metadata|${string}`]: string;
};

export const mapFiltersToAssetsAdvancedFilters = (
  {
    dataSetIds,
    labels,
    createdTime,
    lastUpdatedTime,
    externalIdPrefix,
    source,
    metadata,
    internalId,
  }: InternalAssetFilters,
  searchQueryMetadataKeys?: Record<string, string>,
  query?: string
): AdvancedFilter<AssetsProperties> | undefined => {
  const filtersBuilder = new AdvancedFilterBuilder<AssetsProperties>()
    .in('dataSetId', () => {
      return dataSetIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .containsAny('labels', () => {
      return labels?.reduce((acc, { value }) => {
        if (value !== NIL_FILTER_VALUE) {
          return [...acc, value];
        }
        return acc;
      }, [] as string[]);
    })
    .in('source', () => {
      if (source) {
        return [source];
      }
    })
    .in('id', () => {
      if (internalId) {
        return [internalId];
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

  const nilFiltersBuilder = new AdvancedFilterBuilder<AssetsProperties>()
    .notExists('labels', () => {
      return Boolean(labels?.find(({ value }) => value === NIL_FILTER_VALUE));
    })
    .notExists('source', () => {
      return source === NIL_FILTER_VALUE;
    });

  if (metadata) {
    for (const { key, value } of metadata) {
      filtersBuilder.equals(`metadata|${key}`, value);
    }
  }

  const searchQueryBuilder = new AdvancedFilterBuilder<AssetsProperties>();
  if (query) {
    searchQueryBuilder.search('name', query).search('description', query);
  }

  const searchMetadataBuilder = new AdvancedFilterBuilder<AssetsProperties>();
  if (searchQueryMetadataKeys) {
    for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
      searchMetadataBuilder.prefix(`metadata|${key}`, value);
    }
  }

  return new AssetsAdvancedFilterBuilder<AssetsProperties>()
    .setFilters(filtersBuilder)
    .setNilFilters(nilFiltersBuilder)
    .setSearchQuery(searchQueryBuilder)
    .setSearchQueryMetadataKeys(searchMetadataBuilder)
    .build();
};
