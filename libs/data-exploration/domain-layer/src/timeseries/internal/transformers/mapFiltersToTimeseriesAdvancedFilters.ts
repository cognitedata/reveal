import { isNumeric } from '@data-exploration-lib/core';
import { NIL_FILTER_VALUE } from '@data-exploration-lib/domain-layer';
import {
  AdvancedFilter,
  AdvancedFilterBuilder,
} from '@data-exploration-lib/domain-layer';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { InternalTimeseriesFilters } from '../types';

export type TimeseriesProperties = {
  assetIds: number[];
  dataSetId: number[];
  unit: string | string[];
  externalId: string;
  name: string;
  id: number;
  isStep: boolean;
  isString: boolean;
  description: string;
  metadata: string;
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
    isStep,
    isString,
    internalId,
  }: InternalTimeseriesFilters,
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
        .in('unit', () => {
          // this condition need to be removed when remove the legacy implementation
          if (unit && !isArray(unit)) {
            return [unit];
          }
          return unit;
        })
        .notExists('unit', () => {
          if (!unit) return false;
          if (isArray(unit)) {
            return unit.includes(NIL_FILTER_VALUE);
          }

          return unit === NIL_FILTER_VALUE;
        })
    )
    .equals('id', internalId)
    .equals('isStep', isStep)
    .equals('isString', isString)
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
    const searchQueryBuilder = new AdvancedFilterBuilder<TimeseriesProperties>()
      .search('name', isEmpty(query) ? undefined : query)
      .search('description', isEmpty(query) ? undefined : query);

    /**
     * We want to filter all the metadata keys with the search query, to give a better result
     * to the user when using our search.
     */
    searchQueryBuilder.prefix(`metadata`, query);

    if (isNumeric(query)) {
      searchQueryBuilder.equals('id', Number(query));
    }

    searchQueryBuilder.prefix('unit', query);

    searchQueryBuilder.prefix('externalId', query);

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<TimeseriesProperties>().and(builder).build();
};
