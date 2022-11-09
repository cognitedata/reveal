import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import isEmpty from 'lodash/isEmpty';
import { InternalEventsFilters } from '../types';

export type EventsProperties = {
  assetIds: number[];
  dataSetId: number[];
  type: string;
  subtype: string;
  source: string[];
  externalId: string;
  description: string;
  [key: `metadata|${string}`]: string;
};

export const mapFiltersToEventsAdvancedFilters = (
  {
    source,
    type,
    subtype,
    metadata,
    createdTime,
    lastUpdatedTime,
    startTime,
    endTime,
    externalIdPrefix,
    dataSetIds,
  }: InternalEventsFilters,
  searchQueryMetadataKeys?: Record<string, string>,
  query?: string
): AdvancedFilter<EventsProperties> | undefined => {
  const builder = new AdvancedFilterBuilder<EventsProperties>();

  const filterBuilder = new AdvancedFilterBuilder<EventsProperties>()
    .in('dataSetId', () => {
      return dataSetIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .equals('type', type)
    .equals('subtype', subtype)
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
    .range('startTime', {
      lte: startTime?.max as number,
      gte: startTime?.min as number,
    })
    .range('endTime', {
      lte:
        endTime && !('isNull' in endTime)
          ? (endTime?.max as number)
          : undefined,
      gte:
        endTime && !('isNull' in endTime)
          ? (endTime?.min as number)
          : undefined,
    })
    .search('description', isEmpty(query) ? undefined : query);

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
    const searchMetadataBuilder = new AdvancedFilterBuilder<EventsProperties>();

    for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
      searchMetadataBuilder.prefix(`metadata|${key}`, value);
    }

    builder.or(searchMetadataBuilder);
  }

  return new AdvancedFilterBuilder<EventsProperties>().or(builder).build();
};
