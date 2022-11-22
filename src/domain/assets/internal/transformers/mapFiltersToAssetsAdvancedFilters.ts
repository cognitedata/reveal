import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import { NIL_FILTER_VALUE } from 'domain/constants';
import { isNumeric } from 'utils';
import { InternalAssetFilters } from '../types';

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
    createdTime,
    lastUpdatedTime,
    externalIdPrefix,
    source,
    labels,
    metadata,
    internalId,
  }: InternalAssetFilters,
  searchQueryMetadataKeys?: Record<string, string>,
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
          if (source && source !== NIL_FILTER_VALUE) {
            return [source];
          }
        })
        .notExists('source', source === NIL_FILTER_VALUE)
    )
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

  if (metadata) {
    for (const { key, value } of metadata) {
      filterBuilder.equals(`metadata|${key}`, value);
    }
  }

  builder.and(filterBuilder);

  if (query) {
    const searchQueryBuilder = new AdvancedFilterBuilder<AssetsProperties>()
      .search('name', query)
      .search('description', query);

    /**
     * We want to filter all the metadata keys with the search query, to give a better result
     * to the user when using our search.
     */
    if (searchQueryMetadataKeys) {
      for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
        searchQueryBuilder.prefix(`metadata|${key}`, value);
      }
    }

    searchQueryBuilder.in('id', () => {
      if (query && isNumeric(query)) {
        return [Number(query)];
      }
    });

    searchQueryBuilder.equals('externalId', query);

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<AssetsProperties>().and(builder).build();
};
