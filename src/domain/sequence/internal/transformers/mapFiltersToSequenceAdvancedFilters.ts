import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import isEmpty from 'lodash/isEmpty';
import { isNumeric } from 'utils/numbers';
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
  // searchQueryMetadataKeys?: Record<string, string>,
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

  if (metadata) {
    for (const { key, value } of metadata) {
      filterBuilder.equals(`metadata|${key}`, value);
    }
  }

  builder.and(filterBuilder);

  if (query) {
    const searchQueryBuilder = new AdvancedFilterBuilder<SequenceProperties>()
      .search('name', isEmpty(query) ? undefined : query)
      .search('description', isEmpty(query) ? undefined : query);

    /**
     * We want to filter all the metadata keys with the search query, to give a better result
     * to the user when using our search.
     */
    // if (searchQueryMetadataKeys) {
    //   for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
    //     searchQueryBuilder.prefix(`metadata|${key}`, value);
    //   }
    // }

    searchQueryBuilder.in('id', () => {
      if (query && isNumeric(query)) {
        return [Number(query)];
      }
    });
    searchQueryBuilder.prefix('externalId', query);

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<SequenceProperties>().and(builder).build();
};
