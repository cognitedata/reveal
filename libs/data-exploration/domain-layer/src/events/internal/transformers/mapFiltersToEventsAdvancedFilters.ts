import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import {
  EventConfigType,
  InternalEventsFilters,
  isNumeric,
  METADATA_ALL_VALUE,
} from '@data-exploration-lib/core';

import { AdvancedFilter, AdvancedFilterBuilder } from '../../../builders';
import { NIL_FILTER_VALUE } from '../../../constants';
import { getSearchConfig } from '../../../utils';

export type EventsProperties = {
  assetIds: number[];
  dataSetId: number[];
  type: string | string[];
  subtype: string | string[];
  source: string[];
  externalId: string;
  description: string;
  id: number;
  metadata: string;
  [key: `metadata|${string}`]: string;
};

export const mapFiltersToEventsAdvancedFilters = (
  {
    assetIds,
    dataSetIds,
    createdTime,
    lastUpdatedTime,
    externalIdPrefix,
    type,
    startTime,
    endTime,
    subtype,
    sources,
    metadata,
    internalId,
  }: InternalEventsFilters,
  query?: string,
  searchConfig: EventConfigType = getSearchConfig().event
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
    .in('type', () => {
      // this condition need to be removed when remove the legacy implementation
      if (type && !isArray(type)) {
        return [type];
      }
      return type;
    })
    .containsAny('assetIds', () => assetIds?.map(({ value }) => value))
    .in('subtype', () => {
      // this condition need to be removed when remove the legacy implementation
      if (subtype && !isArray(subtype)) {
        return [subtype];
      }
      return subtype;
    })
    .or(
      new AdvancedFilterBuilder<EventsProperties>()
        .in('source', () => {
          return sources?.reduce((acc, { value }) => {
            if (value !== NIL_FILTER_VALUE) {
              return [...acc, value];
            }
            return acc;
          }, [] as string[]);
        })
        .notExists('source', () => {
          return Boolean(
            sources?.find(({ value }) => value === NIL_FILTER_VALUE)
          );
        })
    )
    .equals('id', internalId)
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
    });

  if (metadata) {
    const metadataBuilder = new AdvancedFilterBuilder<EventsProperties>();
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
    const searchQueryBuilder = new AdvancedFilterBuilder<EventsProperties>();

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
      searchQueryBuilder.equals('metadata', query);
      searchQueryBuilder.prefix('metadata', query);
    }

    if (searchConfig.type.enabled) {
      searchQueryBuilder.equals('type', query);
      searchQueryBuilder.prefix('type', query);
    }

    if (searchConfig.subtype.enabled) {
      searchQueryBuilder.equals('subtype', query);
      searchQueryBuilder.prefix('subtype', query);
    }

    if (searchConfig.source.enabled) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // the type here is a bit wrong, will be refactored in later PRs
      searchQueryBuilder.equals('source', query);
      // @ts-ignore
      searchQueryBuilder.prefix('source', query);
    }

    if (searchConfig.id.enabled && isNumeric(query)) {
      searchQueryBuilder.equals('id', Number(query));
    }

    if (searchConfig.externalId.enabled) {
      searchQueryBuilder.equals('externalId', query);
      searchQueryBuilder.prefix('externalId', query);
    }

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<EventsProperties>().and(builder).build();
};
