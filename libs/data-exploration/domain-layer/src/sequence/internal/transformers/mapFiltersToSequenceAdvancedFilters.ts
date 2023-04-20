import {
  InternalSequenceFilters,
  isNumeric,
  SequenceConfigType,
  METADATA_ALL_VALUE,
} from '@data-exploration-lib/core';
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
  query?: string,
  searchConfig: SequenceConfigType = getSearchConfig().sequence
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
    const metadataBuilder = new AdvancedFilterBuilder<SequenceProperties>();
    for (const { key, value } of metadata) {
      if (value === METADATA_ALL_VALUE) {
        metadataBuilder.exists(`metadata|${key}`);
      } else {
        metadataBuilder.equals(`metadata|${key}`, value);
      }
    }
    filterBuilder.or(metadataBuilder);
  }

  builder.and(filterBuilder);

  if (query && !isEmpty(query)) {
    const searchQueryBuilder = new AdvancedFilterBuilder<SequenceProperties>();

    if (searchConfig.name.enabled) {
      searchQueryBuilder.equals('name', query);
      searchQueryBuilder.prefix('name', query);

      if (searchConfig.name.enabledFuzzySearch) {
        searchQueryBuilder.search('name', query);
      }
    }

    if (searchConfig.description.enabled) {
      searchQueryBuilder.equals('description', query);
      searchQueryBuilder.prefix('description', query);

      if (searchConfig.description.enabledFuzzySearch) {
        searchQueryBuilder.search('description', query);
      }
    }

    /**
     * We want to filter all the metadata keys with the search query, to give a better result
     * to the user when using our search.
     */
    if (searchConfig.metadata.enabled) {
      searchQueryBuilder.equals(`metadata`, query);
      searchQueryBuilder.prefix(`metadata`, query);
    }

    if (isNumeric(query) && searchConfig.id.enabled) {
      searchQueryBuilder.equals('id', Number(query));
    }
    if (searchConfig.externalId.enabled) {
      searchQueryBuilder.equals(`externalId`, query);
      searchQueryBuilder.prefix('externalId', query);
    }

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<SequenceProperties>().and(builder).build();
};
