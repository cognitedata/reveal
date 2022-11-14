import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import isEmpty from 'lodash/isEmpty';
import { InternalTimeseriesFilters } from '../types';

export type TimeseriesProperties = {
  assetIds: number[];
  dataSetId: number[];
  unit: string;
  externalId: string;
  name: string;
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
    .equals('unit', unit)
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

  /**
   * We want to filter all the metadata keys with the search query, to give a better result
   * to the user when using our search.
   */
  if (searchQueryMetadataKeys) {
    const searchMetadataBuilder =
      new AdvancedFilterBuilder<TimeseriesProperties>();

    for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
      searchMetadataBuilder.prefix(`metadata|${key}`, value);
    }

    builder.or(searchMetadataBuilder);
  }

  return new AdvancedFilterBuilder<TimeseriesProperties>().or(builder).build();
};
