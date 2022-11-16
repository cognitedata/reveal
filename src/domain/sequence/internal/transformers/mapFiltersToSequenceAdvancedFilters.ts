import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import isEmpty from 'lodash/isEmpty';
import { InternalSequenceFilters } from '../types';

export type SequenceProperties = {
  assetIds: number[];
  dataSetId: number[];
  externalId: string;
  name: string;
  description: string;
  id: number[];
  [key: `metadata|${string}`]: string;
};

export const mapFiltersToSequenceAdvancedFilters = (
  {
    dataSetIds,
    createdTime,
    lastUpdatedTime,
    externalIdPrefix,
    metadata,
    internalId,
  }: InternalSequenceFilters,
  searchQueryMetadataKeys?: Record<string, string>,
  query?: string
): AdvancedFilter<SequenceProperties> | undefined => {
  const builder = new AdvancedFilterBuilder<SequenceProperties>();

  const filterBuilder = new AdvancedFilterBuilder<SequenceProperties>()
    .in('dataSetId', () => {
      return dataSetIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
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

  if (!isEmpty(query)) {
    const searchQueryBuilder = new AdvancedFilterBuilder<SequenceProperties>()
      .search('name', query)
      .search('description', query);

    filterBuilder.or(searchQueryBuilder);
  }

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
      new AdvancedFilterBuilder<SequenceProperties>();

    for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
      searchMetadataBuilder.prefix(`metadata|${key}`, value);
    }

    builder.or(searchMetadataBuilder);
  }

  return new AdvancedFilterBuilder<SequenceProperties>().or(builder).build();
};
