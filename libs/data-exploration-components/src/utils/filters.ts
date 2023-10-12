import get from 'lodash/get';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';

import { Metadata, IdEither, DateRange } from '@cognite/sdk';

import {
  InternalEventsFilters,
  InternalFilesFilters,
  InternalSequenceFilters,
  InternalAssetFilters,
} from '@data-exploration-lib/core';

import { ResourceFilterProps, ResourceType } from '../types';

export type FiltersWithResourceType = Required<ResourceFilterProps> & {
  resourceType: ResourceType;
};

export type FilterType =
  | InternalAssetFilters
  | InternalEventsFilters
  | InternalFilesFilters
  | InternalSequenceFilters
  | {
      name?: string | undefined;
      externalIdPrefix?: string | undefined;
      metadata?: Metadata | undefined;
      assetIds?: number[] | undefined;
      rootAssetIds?: number[] | undefined;
      dataSetIds?: IdEither[] | undefined;
      assetSubtreeIds?: IdEither[] | undefined;
      createdTime?: DateRange | undefined;
      lastUpdatedTime?: DateRange | undefined;
    }
  | undefined;

/**
 * Computes number of filters applied for a given resource type.
 * @param filter the type of the filter based on selected resource.
 * @returns Number of filters applied to that resource type.
 */
export const countByFilter = (filter: Partial<FilterType>) => {
  const count = filter
    ? Object.values(filter).filter((f) => isBoolean(f) || (!!f && !isEmpty(f)))
        .length
    : 0;
  return count;
};

export const getSelectedFilter = ({
  resourceType,
  assetFilter,
  timeseriesFilter,
  sequenceFilter,
  eventFilter,
  fileFilter,
}: FiltersWithResourceType): FilterType => {
  switch (resourceType) {
    case 'asset': {
      return assetFilter;
    }
    case 'event': {
      return eventFilter;
    }
    case 'timeSeries': {
      return timeseriesFilter;
    }
    case 'file': {
      return fileFilter;
    }
    case 'sequence': {
      return sequenceFilter;
    }
    default: {
      return undefined;
    }
  }
};

export const extractSources = <T>(items: T[]) => {
  const sources: Set<string> = new Set();

  items.forEach((item) => {
    const source = get(item, 'source');

    if (source) {
      sources.add(String(source));
    }
  });

  return Array.from(sources);
};
