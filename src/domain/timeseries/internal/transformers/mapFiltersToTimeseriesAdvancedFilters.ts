import { NIL_FILTER_VALUE } from 'domain/constants';
import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import isEmpty from 'lodash/isEmpty';
import { isNumeric } from 'utils/numbers';
import { InternalTimeseriesFilters } from '../types';

export type TimeseriesProperties = {
  assetIds: number[];
  dataSetId: number[];
  unit: string;
  externalId: string;
  name: string;
  id: number[];
  description: string;
  [key: `metadata|${string}`]: string;
};

export const mapFiltersToTimeseriesAdvancedFilters = (
  {
    dataSetIds,
    createdTime,
    lastUpdatedTime,
    externalIdPrefix,
    unit,
    metadata,
    internalId,
  }: InternalTimeseriesFilters,
  searchQueryMetadataKeys?: Record<string, string>,
  query?: string
): AdvancedFilter<TimeseriesProperties> | undefined => {
  const builder = new AdvancedFilterBuilder<TimeseriesProperties>();

  const filterBuilder = new AdvancedFilterBuilder<TimeseriesProperties>()
    .in('dataSetId', () => {
      return dataSetIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .or(
      new AdvancedFilterBuilder<TimeseriesProperties>()
        .equals('unit', unit === NIL_FILTER_VALUE ? undefined : unit)
        .notExists('unit', unit === NIL_FILTER_VALUE)
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
    })
    .search('name', isEmpty(query) ? undefined : query); // TODO? is name working for search??

  if (metadata) {
    for (const { key, value } of metadata) {
      filterBuilder.equals(`metadata|${key}`, value);
    }
  }

  builder.and(filterBuilder);

  if (query) {
    const searchQueryBuilder = new AdvancedFilterBuilder<TimeseriesProperties>()
      .search('name', isEmpty(query) ? undefined : query)
      .search('description', isEmpty(query) ? undefined : query);

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

  return new AdvancedFilterBuilder<TimeseriesProperties>().and(builder).build();
};
