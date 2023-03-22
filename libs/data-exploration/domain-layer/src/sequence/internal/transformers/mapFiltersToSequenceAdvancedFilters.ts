import { InternalSequenceFilters, isNumeric } from '@data-exploration-lib/core';
import {
  AdvancedFilter,
  AdvancedFilterBuilder,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import { getSearchConfig } from '../../../utils';

export type SequenceProperties = {
  assetIds: number[];
  dataSetId: number[];
  externalId: string;
  name: string;
  description: string;
  id: number;
  metadata: string;
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
      filterBuilder.equals(`metadata|${key}`, value);
    }
  }

  builder.and(filterBuilder);

  if (query) {
    const searchQueryBuilder = new AdvancedFilterBuilder<SequenceProperties>();
    const searchConfigData = getSearchConfig();

    if (searchConfigData.sequence.name.enabled) {
      searchQueryBuilder.search('name', isEmpty(query) ? undefined : query);
    }
    if (searchConfigData.sequence.description.enabled) {
      searchQueryBuilder.search(
        'description',
        isEmpty(query) ? undefined : query
      );
    }

    /**
     * We want to filter all the metadata keys with the search query, to give a better result
     * to the user when using our search.
     */
    if (searchConfigData.sequence.metadata.enabled) {
      searchQueryBuilder.prefix(`metadata`, query);
    }

    if (isNumeric(query) && searchConfigData.sequence.id.enabled) {
      searchQueryBuilder.equals('id', Number(query));
    }
    if (searchConfigData.sequence.externalId.enabled) {
      searchQueryBuilder.prefix('externalId', query);
    }

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<SequenceProperties>().and(builder).build();
};
